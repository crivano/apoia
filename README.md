![alt text](https://github.com/trf2-jus-br/apoia/blob/main/public/apoia-logo-transp.png?raw=true)

# ApoIA

ApoIA é uma ferramenta de inteligência artificial generativa originalmente desenvolvida para auxiliar na triagem de acervos. Ela analisa documentos de processos e gera resumos das principais peças e gera um relatório sobre acervo.

A ApoIA também pode ser utilizada para realizar uma Análise Processual on-line, a partir da informação do número do processo.

Outros recursos disponíveis são a geração de ementas conforme Resolução 156/2024 do CNJ e a revisão de textos por inteligência artificial.

Clique [aqui](https://docs.google.com/presentation/d/1XTmGNOI3O3yaBOEXa5A3ViVHlCy4kvB4e0G2qEmmgLo/edit?usp=sharing) para ver uma apresentação da ApoIA.

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

## Executando a ApoIA em Modo de Desenvolvimento

1. Faça o [download](https://nodejs.org/en/download/prebuilt-installer) e instale o Node.js ou, se já tiver o Node.js instalado, [atualize o Node.js e o NPM para as últimas versões](https://horadecodar.com.br/como-atualizar-node-e-npm-para-ultima-versao/)

2. Faça o [donwload](https://code.visualstudio.com/download) e instale o VSCode

3. Clone o repositório da ApoIA

```shell
$ cd seu-diretorio-de-repositórios
$ git clone https://github.com/trf2-jus-br/apoia
```

4. Abra o VSCode no diretório `seu-diretorio-de-repositórios/apoia` (utilize o menu `File/Open Folder`)

5. Crie o arquivo de configuração conforme explicado acima

6. Abra o terminal no VSCode (utilize o menu `Terminal/New Terminal`) depois instale as dependências com o comando abaixo:

```shell
$ npm install
```

7. Execute a aplicação em modo de desenvolvimento com o comando no terminal:

```shell
$ npm run dev
```

## Fazendo o Deploy em Produção com Docker ou Vercel

1. [Instale o Docker](https://docs.docker.com/get-started/get-docker/) na sua máquina

2. Edite o arquivo `docker-compose.yaml` e ajuste o valor das configurações em `services/apoiaserver/environment`

3. Execute a aplicação e depois aponte o navegador para `http://localhost:8080`

```shell
$ docker-compose up
```

4. Se desejar apenas criar o container do docker, isso pode ser realizado assim:

```shell
$ docker build -t apoiaserver .
```

Caso deseje fazer deploy na nuvem, a ApoIA funciona perfeitamente no Vercel, basta indicar o repositório do GitHub e inserir as configurações.

## Testando os Prompts

A ApoIA utiliza o framework PromptFoo para realizar testes em seus prompts.

Para executar o teste de um prompt específico, vá para o diretório onde se encontra o arquivo prompt.txt e execute o comando:

```bash
npx promptfoo@latest eval --env-file ../../.env.local --no-table --repeat 1 -c test.yaml
```

Para abrir a visualização dos resultados no browser, digite:

```bash
npx promptfoo@latest view
```