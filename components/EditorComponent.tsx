"use client";

import {
    MDXEditor, MDXEditorMethods, headingsPlugin, listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    toolbarPlugin,
    BoldItalicUnderlineToggles,
    BlockTypeSelect,
    DiffSourceToggleWrapper,
    diffSourcePlugin
} from "@mdxeditor/editor"
import { FC } from "react"

interface EditorProps {
    markdown: string;
    editorRef?: React.MutableRefObject<MDXEditorMethods | null>;
    onChange: (markdown: string) => void;
}

/**
 * Extend this Component further with the necessary plugins or props you need.
 * proxying the ref is necessary. Next.js dynamically imported components don't support refs.
 */
const Editor: FC<EditorProps> = ({ markdown, editorRef, onChange }) => {
    return (
        <MDXEditor
            className="mdx-editor"
            onChange={(e) => onChange(e)}
            ref={editorRef}
            markdown={markdown}
            plugins={[
                // Example Plugin Usage
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
                diffSourcePlugin({
                    diffMarkdown: 'An older version',
                    viewMode: 'diff',
                    readOnlyDiff: true
                }),
                toolbarPlugin({
                    toolbarContents: () => (
                        <>
                            {' '}
                            <DiffSourceToggleWrapper options={['rich-text', "source"]}>
                                <BlockTypeSelect />
                                <BoldItalicUnderlineToggles />
                            </DiffSourceToggleWrapper>
                        </>
                    )
                }),
            ]}
        />
    );
};

export default Editor;