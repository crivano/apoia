const ErrorMsg = async ({ pDadosDoProcesso }) => {
    const dadosDoProcesso = await pDadosDoProcesso
    if (dadosDoProcesso && !dadosDoProcesso.errorMsg)
        return ''

    return (<div className="alert alert-danger">{dadosDoProcesso.errorMsg}</div>)
}

export default ErrorMsg
