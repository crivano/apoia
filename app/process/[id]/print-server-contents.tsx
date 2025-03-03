import Print from './print'

const PrintServerContents = async ({ pDadosDoProcesso, numeroDoProcesso }) => {
    const dadosDoProcesso = await pDadosDoProcesso
    if (!dadosDoProcesso || dadosDoProcesso.errorMsg)
        return ''

    return (<Print numeroDoProcesso={numeroDoProcesso}/>)
}

export default PrintServerContents
