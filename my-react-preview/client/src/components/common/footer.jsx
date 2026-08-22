import { useNavigate } from "react-router-dom";
import { usePublicTheme } from "./usePublicTheme";

export default function SpeedMockooter() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const [theme] = usePublicTheme();

  const links = [
    { label: "Legal Terms", href: "#", onClick: () => navigate("/legal") },
    { label: "Privacy Policy", href: "#", onClick: () => navigate("/privacy") },
    { label: "RefundPolicy", href: "#", onClick: () => navigate("/refund") },
    { label: "Contact Us", className: "contact", href: "#", onClick: () => navigate("/contact") }
  ];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --fuchsia: #e91e8c;
          --fuchsia-bright: #ff3aaa;
          --fuchsia-deep: #b5005f;
        }
        [data-theme="light"] {
          --grey-900: #f4f8ff;
          --grey-600: #cbd5e1;
          --grey-400: #64748b;
          --grey-200: #1e293b;
          --footer-border: rgba(217,70,239,0.18);
        }
        [data-theme="dark"] {
          --grey-900: #0e0e12;
          --grey-600: #32323f;
          --grey-400: #7a7a90;
          --grey-200: #c8c8d8;
          --footer-border: rgba(233,30,140,0.18);
        }

        .footer {
          position: relative;
          background: var(--grey-900);
          border-top: 1px solid var(--footer-border);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 24px 5%;
          text-align: center;
          transition: background 0.4s, border-color 0.4s;
        }

        .footer::before {
          content: '';
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 600px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--fuchsia), transparent);
        }

        .footer-copy {
          font-size: 0.8rem; color: var(--grey-400); font-weight: 400;
        }
        .footer-copy strong {
          color: var(--fuchsia-bright); font-weight: 700;
        }

        .footer-links {
          display: flex; gap: 6px; list-style: none; flex-wrap: wrap; align-items: center;
        }

        .footer-links li { display: flex; align-items: center; gap: 6px; }

        .footer-links li:not(:last-child)::after {
          content: '·'; color: var(--grey-600); font-size: 0.9rem;
        }

        .footer-links a {
          font-size: 0.8rem; color: var(--grey-400); text-decoration: none;
          font-weight: 500; transition: color 0.18s; cursor: pointer;
        }
        .footer-links a:hover { color: var(--fuchsia-bright); }
      `}</style>

      <footer className="footer" data-theme={theme}>
        <div className="footer-copy">
          © {year} <strong>SpeedMock</strong>. All rights reserved.
        </div>
        <ul className="footer-links">
          {links.map((l) => (
            <li key={l.label}><a href={l.href} onClick={(e) => { e.preventDefault(); l.onClick?.(); }}>{l.label}</a></li>
          ))}
        </ul>
      </footer>
    </>
  );
}
