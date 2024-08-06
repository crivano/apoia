const ErrorMsg = async ({ pDadosDoProcesso }) => {
    const pecas = await pDadosDoProcesso
    if (pecas && !pecas.errorMsg)
        return ''

    return (<div className="alert alert-danger">{pecas.errorMsg}</div>)
}

export default ErrorMsg
