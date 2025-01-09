import { Container } from 'react-bootstrap'
import TestPage from './TestPage'
import fs from 'fs'
import { TestFileType } from './testfiletype';
import { envString } from '@/lib/utils/env';

export default async function Revison() {
    const directoryPath = envString('TESTS_PATH') as string

    const getTestFiles = () => {
        const files = fs.readdirSync(directoryPath);
        const textFiles = files.filter((file) => file.endsWith('.txt'))

        const contents: TestFileType[] = textFiles.map((file): TestFileType => {
            const filePath = `${directoryPath}/${file}`;
            return { file, contents: fs.readFileSync(filePath, 'utf-8') }
        })

        return contents;
    };

    // Call the function to get the array of text files contents
    const textFilesContents: TestFileType[] = getTestFiles();


    return (<Container fluid={false}>
        <TestPage tests={getTestFiles()} />
    </Container>)
}