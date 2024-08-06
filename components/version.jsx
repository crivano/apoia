import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();
const version = publicRuntimeConfig?.version

export default function Version() {
    return (<>
        <div className="container-fluid mt-t mb-3"><div className="row">
            <div className="col-auto me-auto"></div>
            <div className="col-auto"><span style={{ color: "lightgrey", borderTop: "1px solid lightgrey" }}>v{version}</span></div>
        </div></div>
    </>
    )

}