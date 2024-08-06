export default function EventList(params) {
  const change = params.events

  const actMiniTitle = (name, active, explanation) => {
    return active ? explanation : name
  }

  return ''

  if (!change || change.length === 0)
    return ''

  return (
    <div className="col col-12 eventos">
      <div className="headline headline-md">
        <h2>Eventos</h2>
      </div>
      <table className="table table-striped table-sm">
        <thead>
          <tr>
            <th>Tempo</th>
            <th>Responsável</th>
            <th>Tipo</th>
            <th>Descrição</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {change.map((chg, i) => (
            <tr key={chg.id}
              className={
                chg.tipo === 'Cancelamento' ||
                  chg.idCanceladora !== undefined ||
                  chg.idDesabilitadora !== undefined
                  ? 'change-inactive'
                  : ''
              }
            >
              <td>
                <span title={`${chg.dt.substring(0, 10)} ${chg.dt.substring(11, 19)}`}>
                  {chg.tempoRelativo}
                </span>
              </td>
              <td>{chg.agente}</td>
              <td>{chg.tipo}</td>
              <td>{chg.descr}</td>
              <td style={{ textAlign: 'center' }}>
                <ul style={{ marginBottom: '0px' }} className="list-unstyled blog-tags">
                  {(chg.action || []).map((act, j) => (
                    <li
                      key={j}
                      style={{ marginBottom: '0px', paddingBottom: '0px', paddingTop: '0px' }}
                      className={`blog-tags-enabled-${act.active}`}
                    >
                      <i
                        title={actMiniTitle(act.name, act.active, act.explanation)}
                        className={act.icon}
                      ></i>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}