export default function ActionList(params) {
  const action = params.actions

  const actMiniTitle = (name, active, explanation) => {
    return active ? explanation : name
  }

  return ''

  // if (!action || action.length === 0)
  //   return ''

  return (
    <div className="col col-12">
      <div className="headline headline-md">
        <h2>Ações</h2>
      </div>
      <ul className="list-unstyled blog-tags xrp-actions">
        {(action || []).map((act, l) => (
          <li
            key={l}
            title={act.explanation}
            className={`blog-tags-enabled-${act.active}`}
          >
            <i className={act.icon}></i>
            {act.name}
          </li>
        ))}
      </ul>
    </div>
  )
}