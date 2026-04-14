import { Link } from 'react-router-dom';
import { BarChart3, Key, Zap, Upload, Lock, Send, Download, FileText, Shield, Bitcoin } from 'lucide-react';
import { hasIdentity } from './lib/identity';
import './index.css';

function App() {
  const userHasIdentity = hasIdentity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#fea806] shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-black tracking-wider">
            attestr
          </h1>
        </div>
        <div className="bg-black py-3">
          <p className="text-center text-white font-semibold text-lg">
            Bezahlen & Downloaden – Schnell, Sicher, Anonym
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Description */}
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-gray-700 text-lg leading-relaxed">
            <strong>attestr</strong> ermöglicht den Verkauf und Kauf von digitalen Dateien 
            über Bitcoin Lightning. Keine Registrierung nötig – einfach hochladen, 
            Preis festlegen, Link teilen. Oder als Käufer: Bezahlen & sofort downloaden.
          </p>
        </div>

        {/* Action Card - medorder-Style */}
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-xl border-t-4 border-[#fea806] p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-[#fea806]/10 rounded-full flex items-center justify-center border-2 border-[#fea806]">
                <Upload className="w-10 h-10 text-[#fea806]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Datei verkaufen</h2>
              <p className="text-gray-600 text-sm">
                Hochladen, Preis festlegen, teilbaren Link erhalten.
              </p>
            </div>

            <Link
              to="/sell"
              className="block w-full bg-[#fea806] hover:bg-[#e89805] text-black font-bold py-4 px-6 rounded-lg text-center transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              {userHasIdentity ? 'Neuen Stash erstellen' : 'Jetzt starten'}
            </Link>

            <div className="mt-4 text-center">
              {userHasIdentity ? (
                <Link
                  to="/dashboard"
                  className="text-sm text-gray-500 hover:text-[#fea806] transition-colors flex items-center justify-center gap-1.5"
                >
                  <BarChart3 className="w-4 h-4" />
                  Zum Dashboard
                </Link>
              ) : (
                <Link
                  to="/restore"
                  className="text-sm text-gray-500 hover:text-[#fea806] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Key className="w-4 h-4" />
                  Account wiederherstellen
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="w-full max-w-4xl mt-16 px-4">
          <h2 className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">
            So funktioniert's
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                icon: <Lock className="w-6 h-6 text-[#fea806]" />,
                title: 'Verschlüsseln & Hochladen',
                desc: 'Datei wird im Browser verschlüsselt. Der Server sieht den Inhalt nie.',
              },
              {
                step: 2,
                icon: <Send className="w-6 h-6 text-gray-700" />,
                title: 'Link teilen',
                desc: 'Preis in Sats festlegen und den Link mit Käufern teilen.',
              },
              {
                step: 3,
                icon: <Bitcoin className="w-6 h-6 text-[#fea806]" />,
                title: 'Bezahlt werden',
                desc: 'Käufer zahlt via Lightning oder Cashu. Sofortige Auszahlung.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-[#fea806] mb-2">SCHRITT {item.step}</div>
                <h3 className="text-gray-900 font-semibold text-base mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="w-full max-w-4xl mt-16 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-lg bg-[#fea806]/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#fea806]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">100% Client-seitige Verschlüsselung</h3>
                <p className="text-gray-500 text-sm">Deine Dateien werden vor dem Upload verschlüsselt. Nur du und der Käufer haben Zugriff.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-lg bg-[#fea806]/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-[#fea806]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Sofortige Zahlungen</h3>
                <p className="text-gray-500 text-sm">Keine Wartezeiten. Bezahlung und Download in Sekunden via Bitcoin Lightning.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-lg bg-[#fea806]/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-[#fea806]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Keine Accounts nötig</h3>
                <p className="text-gray-500 text-sm">Weder Käufer noch Verkäufer brauchen einen Account. Einfach und datensparsam.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-lg bg-[#fea806]/10 flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-[#fea806]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Jede Datei, jeder Preis</h3>
                <p className="text-gray-500 text-sm">Vom 100-Sat-Preset bis zum 50.000-Sat-Kurs – du bestimmst den Wert deiner Dateien.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-6 mb-4">
            <a
              href="https://github.com/automedix/attestr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              Open Source
            </a>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500 text-sm">
              Ein Projekt von <a href="https://github.com/automedix" className="text-[#fea806] hover:underline font-semibold">automedix</a>
            </span>
          </div>
          <p className="text-xs text-gray-400">
            100% Client-seitige Verschlüsselung • Deine Schlüssel, deine Dateien
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
