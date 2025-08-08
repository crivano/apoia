// run with: npx tsx countpieces.ts <process_number_1>,<process_number_2>,...

// Direct API access without dependencies
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const DATALAKE_API_URL = 'https://api-processo-integracao.data-lake.pdpj.jus.br/processo-api/api/v1';
const DATALAKE_TOKEN = process.env.DATALAKE_TOKEN;

if (!DATALAKE_TOKEN) {
    console.error('Error: DATALAKE_TOKEN not found in environment variables');
    process.exit(1);
}

async function consultarProcesso(numeroDoProcesso: string): Promise<any> {
    const response = await fetch(
        `${DATALAKE_API_URL}/processos/${numeroDoProcesso}`,
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${DATALAKE_TOKEN}`,
                'User-Agent': 'curl'
            }
        }
    );

    let data: any = {};

    if (response.headers.get('Content-Type')?.includes('application/json')) {
        data = await response.json();
    } else {
        const texto = await response.text();
        data = { error: texto };
    }
    
    if (response.status !== 200) {
        throw new Error(data?.message || `HTTP ${response.status}: ${JSON.stringify(data).substring(0, 100)}`);
    }

    return data;
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: npx tsx countpieces.ts <process_number_1>,<process_number_2>,...');
        process.exit(1);
    }

    const processNumbers = args.join(' ').split(',');

    console.log('numero_processo,quantidade_pecas');

    for (const numero of processNumbers) {
        const numeroLimpo = numero.replace(/\D/g, '');
        if (!numeroLimpo) continue;

        try {
            const data = await consultarProcesso(numeroLimpo);
            if (data && data[0] && data[0].tramitacoes && data[0].tramitacoes.length > 0) {
                // Get the first tramitation (main process)
                const processo = data[0].tramitacoes[0];
                const documentos = processo.documentos || [];
                console.log(`${numeroLimpo},${documentos.length}`);
            } else {
                console.log(`${numeroLimpo},0`);
            }
        } catch (error) {
            console.log(`${numeroLimpo},ERROR`);
        }
    }
}

main().catch(console.error);
