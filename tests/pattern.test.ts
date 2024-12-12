import { DocumentPatternMatcher, TipoDocumento, Documento, T } from '@/lib/proc/pattern'

describe('DocumentPatternMatcher', () => {
    let matcher: DocumentPatternMatcher;

    beforeEach(() => {
        matcher = new DocumentPatternMatcher();
    });

    // Helper para criar documentos rapidamente
    const criarDocumentos = (tipos: TipoDocumento[]): Documento[] =>
        tipos.map((tipo, index) => ({
            id: `doc-${index + 1}`,
            tipo
        }));

    describe('Operador EXACT', () => {
        it('deve corresponder a um documento exato', () => {
            const documentos = criarDocumentos([
                TipoDocumento.PETICAO_INICIAL
            ]);

            const padrao = [T.EXACT(TipoDocumento.PETICAO_INICIAL)];
            const resultado = matcher.match(documentos, padrao);

            expect(resultado).toEqual([documentos[0]]);
        });

        it('deve falhar se o documento não corresponder exatamente', () => {
            const documentos = criarDocumentos([
                TipoDocumento.DECISAO
            ]);

            const padrao = [T.EXACT(TipoDocumento.PETICAO_INICIAL)];
            const resultado = matcher.match(documentos, padrao);

            expect(resultado).toBeNull();
        });
    });

    describe('Operador OR', () => {
        it('deve corresponder a qualquer um dos tipos especificados', () => {
            const documentos = criarDocumentos([
                TipoDocumento.DECISAO
            ]);

            const padrao = [T.OR(TipoDocumento.DECISAO, TipoDocumento.SENTENCA)];
            const resultado = matcher.match(documentos, padrao);

            expect(resultado).toEqual([documentos[0]]);
        });

        it('deve falhar se nenhum tipo corresponder', () => {
            const documentos = criarDocumentos([
                TipoDocumento.PETICAO_INICIAL
            ]);

            const padrao = [T.OR(TipoDocumento.DECISAO, TipoDocumento.SENTENCA)];
            const resultado = matcher.match(documentos, padrao);

            expect(resultado).toBeNull();
        });
    });

    describe('Operador ANY', () => {
        it('não deve capturar nenhum documento por padrão', () => {
            const documentos = criarDocumentos([
                TipoDocumento.COMPROVANTE_RESIDENCIA,
                TipoDocumento.CONTESTACAO
            ]);

            const padrao = [T.ANY()];
            const resultado = matcher.match(documentos, padrao);

            expect(resultado).toEqual([]);
        });

        it('deve capturar apenas documentos específicos', () => {
            const documentos = criarDocumentos([
                TipoDocumento.PETICAO_INICIAL,
                TipoDocumento.COMPROVANTE_RESIDENCIA,
                TipoDocumento.DECISAO,
                TipoDocumento.CONTESTACAO
            ]);

            const padrao = [
                T.EXACT(TipoDocumento.PETICAO_INICIAL),
                T.ANY({ capture: [TipoDocumento.COMPROVANTE_RESIDENCIA, TipoDocumento.CONTESTACAO] }),
            ];
            const resultado = matcher.match(documentos, padrao);

            expect(resultado).toEqual([
                documentos[0],
                documentos[1],
                documentos[3]
            ]);
        });

        it('deve excluir tipos específicos', () => {
            const documentos = criarDocumentos([
                TipoDocumento.PETICAO_INICIAL,
                TipoDocumento.DECISAO,
                TipoDocumento.CONTESTACAO
            ]);

            const padrao = [
                T.EXACT(TipoDocumento.PETICAO_INICIAL),
                T.ANY({ capture: [TipoDocumento.CONTESTACAO], except: [TipoDocumento.DECISAO] }),
            ];
            const resultado = matcher.match(documentos, padrao);

            expect(resultado).toBeNull()
        });
    });

    it('deve representar todos os documentos entre operadores EXACT ou OR', () => {
        const documentos = criarDocumentos([
            TipoDocumento.PETICAO_INICIAL,
            TipoDocumento.DECISAO,
            TipoDocumento.CONTESTACAO,
            TipoDocumento.SENTENCA
        ]);

        const padrao = [
            T.EXACT(TipoDocumento.PETICAO_INICIAL),
            T.ANY({ capture: [TipoDocumento.CONTESTACAO], except: [TipoDocumento.DECISAO] }),
            T.EXACT(TipoDocumento.SENTENCA),
        ];
        const resultado = matcher.match(documentos, padrao);

        expect(resultado).toBeNull();
    });


    it('deve representar todos os documentos entre operadores EXACT ou OR e o fim da lista', () => {
        const documentos = criarDocumentos([
            TipoDocumento.PETICAO_INICIAL,
            TipoDocumento.DECISAO,
            TipoDocumento.CONTESTACAO,
            TipoDocumento.SENTENCA
        ]);

        const padrao = [
            T.EXACT(TipoDocumento.PETICAO_INICIAL),
            T.ANY({ capture: [TipoDocumento.CONTESTACAO], except: [TipoDocumento.DECISAO] }),
        ];
        const resultado = matcher.match(documentos, padrao);

        expect(resultado).toBeNull();
    });


    describe('Operador SOME', () => {
        it('deve exigir pelo menos um documento', () => {
            const documentos = criarDocumentos([
                TipoDocumento.PETICAO_INICIAL,
                TipoDocumento.CONTESTACAO
            ]);

            const padrao = [
                T.EXACT(TipoDocumento.PETICAO_INICIAL),
                T.SOME({ capture: [TipoDocumento.CONTESTACAO] })
            ];
            const resultado = matcher.match(documentos, padrao);

            expect(resultado).toEqual([
                documentos[0],
                documentos[1]
            ]);
        });

        it('deve capturar todos os documentos que puder', () => {
            const documentos = criarDocumentos([
                TipoDocumento.PETICAO_INICIAL,
                TipoDocumento.CONTESTACAO,
                TipoDocumento.CONTESTACAO,
                TipoDocumento.DECISAO
            ]);

            const padrao = [
                T.EXACT(TipoDocumento.PETICAO_INICIAL),
                T.SOME({ capture: [TipoDocumento.CONTESTACAO] })
            ];
            const resultado = matcher.match(documentos, padrao);

            expect(resultado).toEqual([
                documentos[0],
                documentos[1],
                documentos[2]
            ]);
        });

        it('deve falhar se nenhum documento for capturado', () => {
            const documentos = criarDocumentos([
                TipoDocumento.PETICAO_INICIAL,
                TipoDocumento.DECISAO
            ]);

            const padrao = [
                T.EXACT(TipoDocumento.PETICAO_INICIAL),
                T.SOME({ capture: [TipoDocumento.CONTESTACAO] })
            ];
            const resultado = matcher.match(documentos, padrao);

            expect(resultado).toBeNull();
        });
    });

    describe('Casos Complexos', () => {
        it('deve capturar o último documento de cada tipo', () => {
            const documentos = criarDocumentos([
                TipoDocumento.PETICAO_INICIAL,
                TipoDocumento.DECISAO,
                TipoDocumento.EMBARGO,
                TipoDocumento.DECISAO,
                TipoDocumento.EMBARGO
            ]);

            const padrao = [
                T.ANY(),
                T.EXACT(TipoDocumento.DECISAO),
                T.EXACT(TipoDocumento.EMBARGO)
            ];
            const resultado = matcher.match(documentos, padrao);

            expect(resultado).toEqual([
                documentos[3],
                documentos[4]
            ]);
        });

        it('deve corresponder a um padrão complexo', () => {
            const documentos = criarDocumentos([
                TipoDocumento.PETICAO_INICIAL,
                TipoDocumento.COMPROVANTE_RESIDENCIA,
                TipoDocumento.CONTESTACAO,
                TipoDocumento.DECISAO,
                TipoDocumento.COMPROVANTE_RESIDENCIA
            ]);

            const padrao = [
                T.EXACT(TipoDocumento.PETICAO_INICIAL),
                T.ANY({ capture: [TipoDocumento.CONTESTACAO], except: [TipoDocumento.DECISAO] }),
                T.SOME({ capture: [TipoDocumento.CONTESTACAO, TipoDocumento.COMPROVANTE_RESIDENCIA] })
            ];
            const resultado = matcher.match(documentos, padrao);

            expect(resultado).toEqual([
                documentos[0],
                documentos[2],
                documentos[4]
            ]);
        });
    });

    describe('Casos de Falha', () => {
        it('deve falhar se não houver documentos suficientes', () => {
            const documentos = criarDocumentos([
                TipoDocumento.PETICAO_INICIAL
            ]);

            const padrao = [
                T.EXACT(TipoDocumento.PETICAO_INICIAL),
                T.EXACT(TipoDocumento.DECISAO)
            ];
            const resultado = matcher.match(documentos, padrao);

            expect(resultado).toBeNull();
        });

        it('deve falhar se sobram documentos não processados', () => {
            const documentos = criarDocumentos([
                TipoDocumento.PETICAO_INICIAL,
                TipoDocumento.DECISAO,
                TipoDocumento.CONTESTACAO
            ]);

            const padrao = [
                T.EXACT(TipoDocumento.PETICAO_INICIAL),
                T.EXACT(TipoDocumento.DECISAO)
            ];
            const resultado = matcher.match(documentos, padrao);

            expect(resultado).toBeNull();
        });
    });
    describe('MatchOperator Types', () => {
        describe('EXACT Operator', () => {
            it('should create valid EXACT operator', () => {
                const operator = T.EXACT(TipoDocumento.PETICAO_INICIAL);
                expect(operator).toEqual({
                    type: 'EXACT',
                    docType: TipoDocumento.PETICAO_INICIAL
                });
            });
        });

        describe('OR Operator', () => {
            it('should create valid OR operator with multiple types', () => {
                const operator = T.OR(
                    TipoDocumento.PETICAO_INICIAL,
                    TipoDocumento.DECISAO
                );
                expect(operator).toEqual({
                    type: 'OR',
                    docTypes: [TipoDocumento.PETICAO_INICIAL, TipoDocumento.DECISAO]
                });
            });

            it('should create valid OR operator with single type', () => {
                const operator = T.OR(TipoDocumento.PETICAO_INICIAL);
                expect(operator).toEqual({
                    type: 'OR',
                    docTypes: [TipoDocumento.PETICAO_INICIAL]
                });
            });
        });

        describe('ANY Operator', () => {
            it('should create ANY operator without options', () => {
                const operator = T.ANY();
                expect(operator).toEqual({
                    type: 'ANY',
                    options: undefined
                });
            });

            it('should create ANY operator with capture options', () => {
                const operator = T.ANY({
                    capture: [TipoDocumento.PETICAO_INICIAL]
                });
                expect(operator).toEqual({
                    type: 'ANY',
                    options: {
                        capture: [TipoDocumento.PETICAO_INICIAL]
                    }
                });
            });

            it('should create ANY operator with except options', () => {
                const operator = T.ANY({
                    except: [TipoDocumento.DECISAO]
                });
                expect(operator).toEqual({
                    type: 'ANY',
                    options: {
                        except: [TipoDocumento.DECISAO]
                    }
                });
            });
        });

        describe('SOME Operator', () => {
            it('should create SOME operator without options', () => {
                const operator = T.SOME();
                expect(operator).toEqual({
                    type: 'SOME',
                    options: undefined
                });
            });

            it('should create SOME operator with capture options', () => {
                const operator = T.SOME({
                    capture: [TipoDocumento.CONTESTACAO]
                });
                expect(operator).toEqual({
                    type: 'SOME',
                    options: {
                        capture: [TipoDocumento.CONTESTACAO]
                    }
                });
            });

            it('should create SOME operator with except options', () => {
                const operator = T.SOME({
                    except: [TipoDocumento.DECISAO]
                });
                expect(operator).toEqual({
                    type: 'SOME',
                    options: {
                        except: [TipoDocumento.DECISAO]
                    }
                });
            });
        });

        describe('Complex Operator Combinations', () => {
            it('should create a complex pattern with multiple operators', () => {
                const pattern = [
                    T.EXACT(TipoDocumento.PETICAO_INICIAL),
                    T.OR(TipoDocumento.DECISAO, TipoDocumento.SENTENCA),
                    T.ANY({ except: [TipoDocumento.EMBARGO] }),
                    T.SOME({ capture: [TipoDocumento.CONTESTACAO] })
                ];

                expect(pattern).toHaveLength(4);
                expect(pattern[0].type).toBe('EXACT');
                expect(pattern[1].type).toBe('OR');
                expect(pattern[2].type).toBe('ANY');
                expect(pattern[3].type).toBe('SOME');
            });
        });
        describe('Pattern Matching Behavior', () => {
            let matcher: DocumentPatternMatcher;

            beforeEach(() => {
                matcher = new DocumentPatternMatcher();
            });

            describe('ANY Operator Processing', () => {
                it("shouldn't capture if capture is not defined", () => {
                    const docs = criarDocumentos([
                        TipoDocumento.PETICAO_INICIAL,
                        TipoDocumento.CONTESTACAO,
                        TipoDocumento.DECISAO
                    ]);

                    const pattern = [T.ANY()];
                    const result = matcher.match(docs, pattern);

                    expect(result).toEqual([]);
                });

                it('should process documents in order', () => {
                    const docs = criarDocumentos([
                        TipoDocumento.PETICAO_INICIAL,
                        TipoDocumento.CONTESTACAO,
                        TipoDocumento.DECISAO
                    ]);

                    const pattern = [T.ANY({
                        capture: [TipoDocumento.PETICAO_INICIAL,
                        TipoDocumento.CONTESTACAO,
                        TipoDocumento.DECISAO]
                    })];
                    const result = matcher.match(docs, pattern);

                    expect(result).toEqual(docs);
                });

                it('should respect capture list strictly', () => {
                    const docs = criarDocumentos([
                        TipoDocumento.PETICAO_INICIAL,
                        TipoDocumento.CONTESTACAO
                    ]);

                    const pattern = [T.ANY({ capture: [TipoDocumento.CONTESTACAO] })];
                    const result = matcher.match(docs, pattern);

                    expect(result).toEqual([docs[1]]);
                });

                it('should handle min/max constraints correctly', () => {
                    const docs = criarDocumentos([
                        TipoDocumento.CONTESTACAO,
                        TipoDocumento.CONTESTACAO,
                        TipoDocumento.DECISAO
                    ]);

                    const pattern = [T.ANY({ capture: [TipoDocumento.CONTESTACAO] })];
                    const result = matcher.match(docs, pattern);

                    expect(result).toEqual([docs[0], docs[1]]);
                });
            });

            describe('Pattern Sequence Processing', () => {
                it('should process patterns sequentially', () => {
                    const docs = criarDocumentos([
                        TipoDocumento.PETICAO_INICIAL,
                        TipoDocumento.CONTESTACAO,
                        TipoDocumento.DECISAO
                    ]);

                    const pattern = [
                        T.EXACT(TipoDocumento.PETICAO_INICIAL),
                        T.ANY({ capture: [TipoDocumento.CONTESTACAO] })
                    ];

                    const result = matcher.match(docs, pattern);
                    expect(result).toEqual([docs[0], docs[1]]);
                });

                it('should stop at first non-matching document', () => {
                    const docs = criarDocumentos([
                        TipoDocumento.PETICAO_INICIAL,
                        TipoDocumento.DECISAO,
                        TipoDocumento.CONTESTACAO
                    ]);

                    const pattern = [
                        T.EXACT(TipoDocumento.PETICAO_INICIAL),
                        T.ANY({ capture: [TipoDocumento.CONTESTACAO] })
                    ];

                    const result = matcher.match(docs, pattern);
                    expect(result).toEqual([docs[0], docs[2]]);
                });
            });

            describe('Edge Cases', () => {
                it('should handle empty document list', () => {
                    const docs: Documento[] = [];
                    const pattern = [T.ANY()];

                    const result = matcher.match(docs, pattern);
                    expect(result).toBeNull();
                });

                it('should handle empty pattern', () => {
                    const docs = criarDocumentos([TipoDocumento.PETICAO_INICIAL]);
                    const pattern = [];

                    const result = matcher.match(docs, pattern);
                    expect(result).toBeNull()
                });

                it('should handle complex except/capture combination', () => {
                    const docs = criarDocumentos([
                        TipoDocumento.PETICAO_INICIAL,
                        TipoDocumento.DECISAO,
                        TipoDocumento.CONTESTACAO
                    ]);

                    const pattern = [
                        T.ANY({
                            capture: [TipoDocumento.PETICAO_INICIAL, TipoDocumento.CONTESTACAO],
                            except: [TipoDocumento.DECISAO]
                        })
                    ];

                    const result = matcher.match(docs, pattern);
                    expect(result).toBeNull()
                });
            });
        });
    });
});