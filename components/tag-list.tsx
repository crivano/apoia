export default function ActionList(params) {
  const tag = params.tags

  return ''

  if (!tag || tag.length === 0)
    return ''

  return (
    <div className="col col-12">
      <div className="headline headline-md">
        <h2>Etiquetas</h2>
      </div>
      <ul className="list-inline margin-bottom-0">
        {tag.map((t, k) => (
          <li key={k} className="btn btn-light xrp-label">
            <i className={`fa fa-${t.icon}`}></i>
            {t.nome}
          </li>
        ))}
      </ul>
    </div>
  )
}