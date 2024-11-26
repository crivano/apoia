import Eureka from 'eureka-js-client'

const client = new Eureka({
    instance: {
        app: `${process.env.APP_CODE}`,
        hostName: process.env.APP_HOST,
        ipAddr: process.env.APP_HOST,
        statusPageUrl: `http://${process.env.APP_HOST}:${process.env.APP_PORT}`,
        vipAddress: `${process.env.APP_CODE}`,
        port: {
            $: process.env.APP_PORT,
            '@enabled': 'true',
        },
        dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn',
        },
        registerWithEureka: true,
        fetchRegistry: true,
    },
    eureka: {
        host: process.env.APP_REGISTRY_HOST,
        port: process.env.APP_REGISTRY_PORT,
        //servicePath: '/eureka/apps/',
    },
})

setTimeout(function() {
    console.log('eureka discovery starting...')
    client.start(error => {
        console.log(error || 'eureka discovery complete')
    })
})