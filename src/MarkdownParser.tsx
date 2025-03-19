import React, { useState, useEffect } from 'react';
import { marked } from 'marked';

interface MarkdownParserProps {
    value: string;
}

const MarkdownParser: React.FC<MarkdownParserProps> = ({ value }) => {
    const [parsedHtml, setParsedHtml] = useState('');

    // Update markdown when the 'value' prop changes
    useEffect(() => {
        if (value) {
            const html = marked(value);
            setParsedHtml(html.toString());
        }
    }, [value]);

    // Render the parsed Markdown as HTML
    return (
        <div
            dangerouslySetInnerHTML={{ __html: parsedHtml }}
        />
    );
};

export default MarkdownParser;
