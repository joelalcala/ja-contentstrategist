import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <html lang="en">
            <head>
                {/* Add any head elements here, like meta tags or links to stylesheets */}
            </head>
            <body>
                <header>Header</header>
                <main>{children}</main>
                <footer>Footer</footer>
            </body>
        </html>
    );
};

export default Layout;