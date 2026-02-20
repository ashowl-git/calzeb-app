'use client'

import Link from 'next/link'

const HOMEPAGE_URL = 'https://askwhy.works'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="contact" className="relative py-16 px-6 border-t border-gray-200 overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">

        {/* Sitemap Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: CalZEB */}
          <div>
            <h4 className="text-xs text-slate-400 uppercase tracking-widest mb-4 font-normal">
              CalZEB
            </h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Home</Link></li>
              <li><Link href="/login" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Sign Up</Link></li>
            </ul>
          </div>

          {/* Column 2: Tools (external links to askwhy.works) */}
          <div>
            <h4 className="text-xs text-slate-400 uppercase tracking-widest mb-4 font-normal">
              Tools
            </h4>
            <ul className="space-y-2">
              <li><a href={`${HOMEPAGE_URL}/nuggets/lm-eco2od`} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Energy Calculator</a></li>
              <li><a href={`${HOMEPAGE_URL}/nuggets/bolumicloud`} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-red-600 transition-colors">BoLumiCloud</a></li>
              <li><a href={`${HOMEPAGE_URL}/nuggets/law-checker`} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Law Tracker</a></li>
              <li><a href={`${HOMEPAGE_URL}/nuggets/contam-editor`} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-red-600 transition-colors">CONTAM Editor</a></li>
            </ul>
          </div>

          {/* Column 3: Research */}
          <div>
            <h4 className="text-xs text-slate-400 uppercase tracking-widest mb-4 font-normal">
              Research
            </h4>
            <ul className="space-y-2">
              <li><a href={`${HOMEPAGE_URL}/layers`} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Layers</a></li>
              <li><a href={`${HOMEPAGE_URL}/publications`} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Publications</a></li>
              <li><a href={`${HOMEPAGE_URL}/nuggets`} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Nuggets</a></li>
            </ul>
          </div>

          {/* Column 4: About */}
          <div>
            <h4 className="text-xs text-slate-400 uppercase tracking-widest mb-4 font-normal">
              About
            </h4>
            <ul className="space-y-2">
              <li><a href={HOMEPAGE_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Research Division</a></li>
              <li><a href={`${HOMEPAGE_URL}/interface`} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Interface</a></li>
              <li><a href="https://api.askwhy.works/docs" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-red-600 transition-colors">API Docs</a></li>
            </ul>
          </div>
        </div>

        {/* Contact & Info Grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-12 border-t border-gray-200 pt-12">

          {/* Left: Organization Info */}
          <div className="relative">
            {/* Background Logo - Behind Text */}
            <div
              className="absolute -left-8 -top-8 w-[280px] h-[280px] pointer-events-none -z-10"
              style={{
                backgroundImage: 'url(/favicon.svg)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                opacity: 0.25,
                filter: 'blur(2px) contrast(1.5) brightness(0.7)'
              }}
            />

            <h3 className="text-sm text-slate-400 uppercase tracking-widest mb-4 font-normal">
              Research Divisi<span className="text-red-600">o</span>n
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              EAN Technology 연구본부
            </p>
          </div>

          {/* Right: Contact Info */}
          <div>
            <h3 className="text-sm text-slate-400 uppercase tracking-widest mb-4 font-normal">
              INTERFACE
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-600 font-normal">안승호</p>
              </div>
              <div>
                <a
                  href="mailto:sha@eantec.co.kr"
                  className="text-xs text-slate-500 hover:text-slate-900 transition-colors font-normal"
                >
                  sha@eantec.co.kr
                </a>
              </div>
              <div>
                <a
                  href="tel:070-4066-6812"
                  className="text-xs text-slate-500 hover:text-slate-900 transition-colors font-normal"
                >
                  070-4066-6812
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-xs text-slate-400 font-normal text-center">
            © {currentYear} EAN Technology Research Division. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  )
}
