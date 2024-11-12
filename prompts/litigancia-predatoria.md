# PROMPT

Entendido. Como não teremos acesso aos documentos anexados, vamos focar apenas nos critérios que podem ser analisados com base no texto da petição inicial.

**Critérios que podem ser analisados apenas pelo texto da petição inicial:**

1. **Requerimento de justiça gratuita sem justificativa ou evidências de necessidade econômica**: Podemos verificar se o pedido de justiça gratuita foi feito sem qualquer justificativa no texto.

2. **Pedido padronizado de dispensa de audiência preliminar ou de conciliação**: O texto pode mostrar um pedido padrão para dispensar audiências preliminares ou de conciliação.

3. **Ajuizamento em comarca distinta do domicílio das partes ou do local do fato**: Se a petição inclui os endereços das partes e menciona a comarca, podemos avaliar essa questão.

4. **Petição inicial genérica sem particularização dos fatos do caso concreto**: Podemos analisar se a petição é genérica e carece de detalhes específicos.

5. **Presença de causas de pedir alternativas relacionadas por hipóteses**: Podemos identificar se a petição inclui causas de pedir alternativas.

6. **Pedidos vagos, hipotéticos ou alternativos sem relação lógica com a causa de pedir**: É possível avaliar a clareza e a lógica entre os pedidos e as causas apresentadas.

7. **Valor da causa elevado e sem relação com as pretensões formuladas**: Se o valor da causa está indicado no texto, podemos analisar sua adequação.

8. **Pedidos declaratórios sem demonstração de utilidade, necessidade e adequação**: Podemos verificar se a petição justifica adequadamente os pedidos declaratórios.

---

**Prompt para análise:**

Por favor, analise o texto da petição inicial fornecida e atribua uma nota de 1 a 5 para cada um dos critérios abaixo, onde:

- **1** significa que o critério não está presente.
- **5** significa que o critério está fortemente presente.

Apresente o resultado em formato JSON, seguindo o exemplo fornecido.

**Critérios:**

1. Requerimento de justiça gratuita sem justificativa ou evidências de necessidade econômica.
2. Pedido padronizado de dispensa de audiência preliminar ou de conciliação.
3. Ajuizamento em comarca distinta do domicílio das partes ou do local do fato.
4. Petição inicial genérica sem particularização dos fatos do caso concreto.
5. Presença de causas de pedir alternativas relacionadas por hipóteses.
6. Pedidos vagos, hipotéticos ou alternativos sem relação lógica com a causa de pedir.
7. Valor da causa elevado e sem relação com as pretensões formuladas.
8. Pedidos declaratórios sem demonstração de utilidade, necessidade e adequação.

**Exemplo de JSON:**

```json
{
  "criterios": {
    "1": 3,
    "2": 1,
    "3": 5,
    "4": 4,
    "5": 2,
    "6": 1,
    "7": 2,
    "8": 5
  }
}
```

**Petição inicial a ser analisada:**

{{textos}}

**Instruções adicionais:**

- Certifique-se de que o JSON final contenha apenas as chaves numéricas correspondentes aos critérios, conforme o exemplo.
- Não inclua comentários ou análises adicionais; apenas forneça o JSON com as notas.
- Caso um critério não possa ser avaliado com base no texto fornecido, atribua a nota **1**.