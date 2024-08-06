export default function EventList(params) {
  const data = params.data

  // return ''

  if (!data)
    return ''

  const evtimp = data.change.find((chg) => chg.autor && chg.reu)

  return (
    <div className="col col-12">
      <div className="headline headline-md">
        <h2>Informações</h2>
      </div>
      <p><span className="topic-caption">Código</span>: {data.codigo && data.codigo.title ? data.codigo.title : data.codigo}</p>
      <p><span className="topic-caption">Número</span>: {evtimp.numeroDoProcesso}</p>
      <p><span className="topic-caption">Órgão</span>: {evtimp.orgao}</p>
      <p><span className="topic-caption">Tipo De Processo</span>:
        {data.tipoDeProcesso === 'PRIMEIRA_INSTANCIA' ? ' Primeira Instância' : ''}
        {data.tipoDeProcesso === 'SEGUNDA_INSTANCIA' ? ' Segunda Instância' : ''}</p>
      <p><span className="topic-caption">Autor</span>: {evtimp.autor}</p>
      <p><span className="topic-caption">Réu</span>: {evtimp.reu}</p>
    </div>
  )
}