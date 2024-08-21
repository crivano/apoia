import { PromptType } from './_prompts'
import { system } from './_system'

export default (data): PromptType => {
    const prompt = `
Você foi designado para organizar uma triagem de processos judiciais.
Leia atentamente o JSON abaixo. Ele contém uma lista de códigos de assunto, descrições e quantidade de processos:

${data.textos.reduce((acc, txt) => acc + txt.texto, '')}

DESCRIÇÃO DA TAREFA:
Por favor, gere um JSON, conforme o modelo abaixo. 
- Primeiro, observem se existem situações que que os assuntos são muito semelhantes, às vezes com mudanças de letras maiúsculas e minúsculas, 
  ou com palavras diferentes, mas que representam exatamente o mesmo tema. Quando isso ocorrer, selecione um assunto para ser o principal e agrupe os demais a ele.
  inclua o código do assunto principal e do outro assunto que representa o mesmo tema no campo "principais".
  Atenção: agrupe apenas assuntos que representam exatamente o mesmo tema.
- Depois, agrupe assuntos semelhantes, criando o que chamaremos de "Agrupamentos"
- Crie uma lista de agrupamentos, que são títulos que representam temas gerais.
- Caso existam assuntos com quantidades muito pequenas de processos, você pode agrupá-los em um assunto mais genérico, ou até mesmo criar um agrupamento chamado "Outros".
- Por fim, crie com cada um dos assuntos originais e informe o agrupamento a que pertence.

{
    "principais: {
        [código do assunto principal]: [[código do assunto que representa exatamente o mesmo tema]]
    },
    "agrupamentos": {
        [Nome do Agrupamento]: [[códigos dos assuntos que pertencem a este agrupamento]] 
    },
}
`
    return {
        message: [
            {
                role: 'system', content: `
            Escreva de modo CONCISO, mas completo e abrangente, sem redundância
            Seja econômico, usando apenas expressões necessárias para a clareza
            Escreve na resposta somente o JSON e nada mais. Começe com o símbolo "{"` },
            { role: 'user', content: prompt }]
    }
}