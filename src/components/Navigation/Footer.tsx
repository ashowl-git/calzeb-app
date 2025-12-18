'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="contact" className="relative py-16 px-6 border-t border-gray-200 overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">

        {/* Sitemap Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Main */}
          <div>
            <h4 className="text-xs text-slate-400 uppercase tracking-widest mb-4 font-normal">
              Main
            </h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Origin</Link></li>
              <li><Link href="/layers" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Layers</Link></li>
              <li><Link href="/nuggets" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Nuggets</Link></li>
              <li><Link href="/publications" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Publications</Link></li>
            </ul>
          </div>

          {/* Column 2: Tools */}
          <div>
            <h4 className="text-xs text-slate-400 uppercase tracking-widest mb-4 font-normal">
              Tools
            </h4>
            <ul className="space-y-2">
              <li><Link href="/nuggets/lm-eco2od" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Energy Calculator</Link></li>
              <li><Link href="/nuggets/law-checker" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Law Tracker</Link></li>
              <li><Link href="/nuggets/krri-metro" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Railway Designer</Link></li>
              <li><Link href="/nuggets/contam-editor" className="text-xs text-slate-500 hover:text-red-600 transition-colors">CONTAM Editor</Link></li>
              <li><Link href="/nuggets/building-ledger" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Building Ledger</Link></li>
              <li><Link href="/nuggets/bolumicloud" className="text-xs text-slate-500 hover:text-red-600 transition-colors">BoLumiCloud</Link></li>
            </ul>
          </div>

          {/* Column 3: Projects */}
          <div>
            <h4 className="text-xs text-slate-400 uppercase tracking-widest mb-4 font-normal">
              Projects
            </h4>
            <ul className="space-y-2">
              <li><Link href="/layers?view=list" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Layers List View</Link></li>
              <li><Link href="/layers?view=network" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Layers Network View</Link></li>
              <li><Link href="/publications?view=list" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Publications List View</Link></li>
              <li><Link href="/publications?view=network" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Publications Network View</Link></li>
            </ul>
          </div>

          {/* Column 4: About */}
          <div>
            <h4 className="text-xs text-slate-400 uppercase tracking-widest mb-4 font-normal">
              About
            </h4>
            <ul className="space-y-2">
              <li><Link href="/agents" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Agents</Link></li>
              <li><Link href="/interface" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Interface</Link></li>
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
