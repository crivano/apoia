# SYSTEM PROMPT

Você conhece profundamente o direito brasileiro e está completamente atualizado juridicamente. 
Você sempre presta informações precisas, objetivas e confiáveis. 
Você não diz nada de que não tenha absoluta certeza.
Você não está autorizada a criar nada; suas respostas devem ser baseadas apenas no texto fornecido.
Adote um tom PROFISSIONAL e AUTORITATIVO, sem jargões desnecessários
Escreva de modo CONCISO, mas completo e abrangente, sem redundância


# PROMPT

Você receberá os textos de algumas peças processuais e deverá identificar todos os pedidos que forem realizados pelo autor. Para cada pedido, pense em algumas fundamentações juridicas para decidir pela procedência ou pela improcedência

## Formato da Resposta

Sua resposta será no formato JSON e deve observar alguns campos padronizados conforme listagens abaixo:

Opções para "tipoDePedido": 
- CONDENAR_A_PAGAR
- CONDENAR_A_FAZER
- CONDENAR_A_DEIXAR_DE_FAZER
- CONSTITUIR_RELACAO_JURIDICA
- ANULAR_RELACAO_JURIDICA
- DECLARAR_EXISTENCIA_DE_FATO
- DECLARAR_INEXISTENCIA_DE_FATO

Opções para "liminar":
- NAO
- SIM

Opções para "verba":
- SALARIO
- DANO_MORAL
- OUTRA
- NENHUMA

Sua resposta deve sempre ser formatada em JSON, conforme o padrão abaixo:

```json
{
  "pedidos": [{
    "texto": "Informe o texto que descreve o pedido",
    "tipoDePedido": "Utilize uma das opções tabeladas",
    "liminar": "Utilize uma das opções tabeladas",
    "verba": "Utilize uma das opções tabeladas se houver, ou omita esta propriedade",
    "valor": Informe o valor numérico em Reais se houver ou 0.00 se não houver,
    "fundamentacoesProcedencia"["Escreva uma ou mais fundamentações jurídicas que possam justificar a procedência"],
    "fundamentacoesImprocedencia"["Escreva uma ou mais fundamentações jurídicas que possam justificar a improcedência"]
  }]
}
```

Sua resposta deve ser um JSON válido. Comece sua resposta com o caractere "{".

## Tarefa Principal

Identifique os pedidos na petição abaixo:

{{textos}}



# JSON SCHEMA

{
    "type": "object",
    "properties": {
        "pedidos": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "texto": {
                        "type": "string"
                    },
                    "tipoDePedido": {
                        "type": "string"
                    },
                    "liminar": {
                        "type": "string"
                    },
                    "verba": {
                        "type": "string"
                    },
                    "valor": {
                        "type": "number"
                    },
                    "fundamentacoesProcedencia": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "fundamentacoesImprocedencia": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "required": [
                    "texto",
                    "tipoDePedido",
                    "liminar",
                    "verba",
                    "valor",
                    "fundamentacoesProcedencia",
                    "fundamentacoesImprocedencia"
                ],
                "additionalProperties": false
            }
        }
    },
    "required": [
        "pedidos"
    ],
    "additionalProperties": false
}

# FORMAT

{% set tipos = {
    CONDENAR_A_PAGAR: 'Condenar a Pagar',
    CONDENAR_A_FAZER: 'Condenar a Fazer',
    CONDENAR_A_DEIXAR_DE_FAZER: 'Condenar a Deixar de Fazer',
    CONSTITUIR_RELACAO_JURIDICA: 'Constituir Relação Jurídica',
    ANULAR_RELACAO_JURIDICA: 'Anular Relação Jurídica',
    DECLARAR_EXISTENCIA_DE_FATO: 'Declarar Existência de Fato',
    DECLARAR_INEXISTENCIA_DE_FATO: 'Declarar Inexistência de Fato'
} %}
{% for d in pedidos %}{{loop.index}}. {% if d.liminar === 'SIM' %}**Liminar** - {% endif %}{{ tipos[d.tipoDePedido] }}: {{ d.texto }}{% if d.valor %} ({{ d.verba }}: {{ (d.valor).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'}) }}){% endif %}
{{"\t"}}- Procedência
{% for f in d.fundamentacoesProcedencia %}{{"\t"}}{{"\t"}}- {{f}}
{% endfor %}{{"\t"}}- Improcedência
{% for f in d.fundamentacoesImprocedencia %}{{"\t"}}{{"\t"}}- {{f}}
{% endfor %}{% endfor %}
