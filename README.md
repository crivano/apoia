# ApoIA

ApoIA é uma ferramenta de inteligência artificial generativa desenvolvida para auxiliar na triagem de acervos. Ela analisa documentos de processos e gera resumos das principais peças e gera um relatório sobre acervo.

A ApoIA também pode ser utilizada para realizar uma Análise Processual on-line, a partir da informação do número do processo.

Outro recurso disponível é a revisão de textos por inteligência artificial.

## Funcionalidades

**Integração com Eproc**: Login, consulta processual e obtenção de peças via MNI.

**Integração com IA**: Repositório de prompts, envio e recebimento, limites de acesso.

**Interface com  o Usuário**: Informação do número do processo, apresentação dos resultados em tempo real, processamento de relatórios.

## Arquitetura

- Desenvolvido em TypeScript, NextJS e Vercel AI SDK
- Compatível com ChatGPT, Claude, Gemini, Llama, etc
- MySQL para gerar relatórios de triagem e armazenar respostas de IA (opcional)
- Pode ser acoplado a qualquer sistema compatível com o MNI
- Sem nenhuma outra dependência

## Configuração

A ApoIA requer que diversas variáveis de ambiente sejam informadas. No ambiente de desenvolvimento, isso pode ser feito criando um arquivo na raiz do projeto chamado `.env.local`.

Primeiro, indique quais são os sistemas aos quais deseja conectar a ApoIA, depois, para cada sistema, informe o endereço do WSDL e do Endpoint do MNI:

```properties
SYSTEMS=TRF2,JFRJ,JFES
TRF2_MNI_WSDL_URL="https://epr.trf2.jus.br/eproc/wsdl.php?srv=intercomunicacao2.2"
TRF2_MNI_ENDPOINT_URL="https://epr.trf2.jus.br/eproc/ws/controlador_ws.php?srv=intercomunicacao2.2"
JFRJ_MNI_WSDL_URL="https://epr.jfrj.jus.br/eproc/wsdl.php?srv=intercomunicacao2.2"
JFRJ_MNI_ENDPOINT_URL="https://epr.jfrj.jus.br/eproc/ws/controlador_ws.php?srv=intercomunicacao2.2"
JFES_MNI_WSDL_URL="https://epr.jfes.jus.br/eproc/wsdl.php?srv=intercomunicacao2.2"
JFES_MNI_ENDPOINT_URL="https://epr.jfes.jus.br/eproc/ws/controlador_ws.php?srv=intercomunicacao2.2"
```

Informe o identificador do modelo de inteligência artificial que deseja utilizar. Outros possíveis seriam: `gpt-4o`, `claude-3-5-sonnet` ou qualquer outro suportado pelo framework Vercel AI.

```properties
MODEL=gpt-4o-mini
```

Forneça a chave da API. Informe a chave de API relativa ao modelo selecionado. As outras não serão utilizadas.

```properties
OPENAI_API_KEY=CHAVE_DE_API_OPENAI
ANTHROPIC_API_KEY=CHAVE_DE_API_ANTHROPIC (opcional)
GOOGLE_API_KEY=CHAVE_DE_API_GOOGLE (opcional)
```

Sugerimos que a ApoIA não tenha acesso a documentos sigilosos. Isso pode ser obtido aplicando a propriedade abaixo:

```properties
CONFIDENTIALITY_LEVEL_MAX=0
```

A Apoia utiliza o framework de autenticação NextAuth, portanto é necessário configurar as propriedades abaixo:

```properties
NEXTAUTH_URL_INTERNAL=http://localhost:8081/
NEXTAUTH_URL=http://localhost:8081/
NEXTAUTH_SECRET=SUBSTITUIR_POR_UM_UUID_ALEATORIO
```

A API da ApoIA funciona com um token JWE, portanto, é necessário configurar as seguintes propriedades:

```properties
JWT_SECRET=SUBSTITUIR_POR_UM_UUID_ALEATORIO
JWT_ISSUER=apoia.trf2.jus.br
JWT_AUDIENCE=apoia.trf2.jus.br
```

Uma encriptação a mais é realizada na senha a partir da chave abaixo:

```properties
PWD_SECRET=SUBSTITUIR_POR_UM_UUID_ALEATORIO
```

Para que a ApoIA possa gerar relatórios de triagem e para que possa fazer o cache dos textos gerados por IA, é necessário conectá-la ao MySQL. Se nenhuma destas funcionalidades for importante, basta omitir os parâmetros abaixo que a ApoIA, ainda que limitada, funcionará.

```properties
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=SUBSTITUIR_PELA_SENHA_DO_MYSQL
MYSQL_DATABASE=apoia
```

Se desejar que a ApoIA, ao clicar sobre o número de um processo, abra o sistema processual, use a configuração abaixo:

```properties
NAVIGATE_TO_PROCESS_URL=https://balcaojush.jfrj.jus.br/balcaojus/#/processo/{numero}?avisos=0
```

## Inicialização do MySQL

Para criar o esquema `apoia`, execute os comandos encontrados no arquivo `migration-001.sql`

## Executando a ApoIA

Depois de clonar o repositório e configurar as variáveis de ambiente, basta instalar as dependências e executar a aplicação:

```bash
npm install
npm run dev
```

A ApoIA funciona perfeitamente no Vercel, caso deseje fazer deploy na nuvem.