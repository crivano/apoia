import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import ImportBsJS from "../components/importBsJS";
import { Navbar, Nav, Container, NavDropdown, NavLink, NavItem } from "react-bootstrap";
import NextAuthProvider from './context/nextAuthProvider';
import UserMenu from "../components/user-menu";
import Link from 'next/link'
import Image from 'next/image'
import '@mdxeditor/editor/style.css'
import { NavigationLink } from "@/components/NavigationLink";

// The following import prevents a Font Awesome icon server-side rendering bug,
// where the icons flash from a very large icon down to a properly sized one:
import '@fortawesome/fontawesome-svg-core/styles.css';
// Prevent fontawesome from adding its CSS since we did it manually above:
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false; /* eslint-disable import/first */


export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <head>
                <meta property="og:title" content="ApoIA" />
                <meta property="og:description" content="ApoIA" />
                <meta property="og:url" content="https://apoia.vercel.app" />
                <meta property="og:image" content="https://apoia.vercel.app/apoia-logo-transp.png" />
            </head>
            <body>
                <ImportBsJS />
                <Navbar bg="primary" expand="lg">
                    <Container fluid={false}>
                        <div className="navbar-brand text-white" style={{ overflow: "hidden" }}>
                            <Link href="/" className="ms-0 me-2" style={{ verticalAlign: "middle" }}>
                                {/* <Image src="/trf2-logo.png" width={34 * 27 / 32} height={34} alt="ApoIA Logo" className="me-0" /> */}
                                <Image src="/apoia-logo-transp.png" width={52} height={52 * 271 / 250} alt="ApoIA Logo" className="me-0" style={{ marginTop: '-1em', marginBottom: '-1em', overflow: "hidden" }} />
                            </Link>
                            <Link href="/" className="text-white ms-0" style={{ textDecoration: "none", fontSize: "120%", verticalAlign: "middle" }}>
                                ApoIA</Link>
                        </div>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <NavItem>
                                <NavigationLink href="/community" text="Prompts" />
                            </NavItem>
                            <NavItem>
                                <NavigationLink href="/" text="Síntese" />
                            </NavItem>
                            <NavItem>
                                <NavigationLink href="/revision" text="Revisão de Texto" />
                            </NavItem>
                            <NavItem>
                                <NavigationLink href="/headnote" text="Ementa" />
                            </NavItem>
                        </div>
                        <UserMenu />
                    </Container>
                </Navbar>
                <NextAuthProvider>
                    <div className="content">
                        {children}
                    </div>
                </NextAuthProvider>
            </body>
        </html>
    );
}
