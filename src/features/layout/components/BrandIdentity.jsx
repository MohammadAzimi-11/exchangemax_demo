import { resolveAssetUrl } from '../../../utils/assets.js'

function getBrandName(profile = {}) {
  return profile.name || profile.companyName || 'Exchange Desk'
}

function getBrandSubtitle(profile = {}) {
  return profile.legalName || profile.address || 'Shop accounting terminal'
}

function getBrandInitials(name) {
  const words = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (words.length > 1) {
    return `${Array.from(words[0])[0] || ''}${Array.from(words[1])[0] || ''}`.toUpperCase()
  }

  return Array.from(words[0] || 'EX').slice(0, 2).join('').toUpperCase()
}

export default function BrandIdentity({ className = 'layout-brand', profile = {} }) {
  const brandName = getBrandName(profile)
  const brandSubtitle = getBrandSubtitle(profile)
  const logoUrl = resolveAssetUrl(profile.logoPath)

  return (
    <div className={className}>
      <div className="layout-brand-mark">
        {logoUrl ? <img alt={`${brandName} logo`} src={logoUrl} /> : getBrandInitials(brandName)}
      </div>
      <div className="layout-brand-text">
        <strong>{brandName}</strong>
        <span>{brandSubtitle}</span>
      </div>
    </div>
  )
}
