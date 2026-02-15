import React, { useEffect } from 'react';

const SEO = ({ title, description, keywords }) => {
    useEffect(() => {
        document.title = `${title} | UtsavNest`;

        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', description);
        } else {
            const meta = document.createElement('meta');
            meta.name = 'description';
            meta.content = description;
            document.head.appendChild(meta);
        }

        if (keywords) {
            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) {
                metaKeywords.setAttribute('content', keywords);
            } else {
                const meta = document.createElement('meta');
                meta.name = 'keywords';
                meta.content = keywords;
                document.head.appendChild(meta);
            }
        }
    }, [title, description, keywords]);

    return null;
};

export default SEO;
