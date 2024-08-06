import Print from './print'

const PrintServerContents = async ({ pDadosDoProcesso, numeroDoProcesso }) => {
    const pecas = await pDadosDoProcesso
    if (!pecas || pecas.errorMsg)
        return ''

    return (<Print numeroDoProcesso={numeroDoProcesso}/>)
}

export default PrintServerContents
