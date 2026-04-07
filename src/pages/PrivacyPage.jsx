import { useNavigate } from 'react-router-dom'

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 36 }}>
    <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, color: 'var(--brown)', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>{title}</h2>
    <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85 }}>{children}</div>
  </div>
)

const P = ({ children }) => <p style={{ marginBottom: 10 }}>{children}</p>
const Li = ({ children }) => <li style={{ marginBottom: 6, paddingLeft: 4 }}>{children}</li>

export default function PrivacyPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'DM Sans',sans-serif" }}>

      {/* Nav */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-card)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brown)', fontSize: 14, fontWeight: 600, padding: 0 }}>
          ← Retour
        </button>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontStyle: 'italic', color: 'var(--brown)', fontWeight: 600 }}>Vesta Home</span>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>

        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: 'var(--brown)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Documents légaux</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 40, fontWeight: 600, fontStyle: 'italic', marginBottom: 12 }}>Politique de confidentialité</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Dernière mise à jour : 1er avril 2026 · Conforme à la Loi 25 (Québec)</p>
        </div>

        <div style={{ background: 'var(--brown-light)', border: '1px solid rgba(184,147,90,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 40 }}>
          <p style={{ fontSize: 13, color: 'var(--brown)', fontWeight: 600, marginBottom: 4 }}>Conformité Loi 25 — Québec</p>
          <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>
            La présente politique est établie conformément à la <em>Loi modernisant des dispositions législatives en matière de protection des renseignements personnels</em> (Loi 25, L.Q. 2021, c. 25) et à la <em>Loi sur la protection des renseignements personnels dans le secteur privé</em> (LPRPSP).
          </p>
        </div>

        <Section title="1. Responsable du traitement">
          <P><strong>Vesta Home Inc.</strong><br/>
          Montréal, Québec, Canada<br/>
          Courriel : <span style={{ color: 'var(--brown)' }}>admin@vestahome.ca</span></P>
          <P>Le responsable de la protection des renseignements personnels (« RPRP ») est joignable à l'adresse courriel ci-dessus pour toute question relative au traitement de vos données.</P>
        </Section>

        <Section title="2. Données personnelles collectées">
          <P>Dans le cadre de la fourniture de nos services, Vesta Home collecte les catégories de renseignements personnels suivantes :</P>
          <ul style={{ paddingLeft: 20 }}>
            <Li><strong>Données d'identification :</strong> nom complet, adresse courriel, numéro de téléphone, date de naissance (Prestataires) ;</Li>
            <Li><strong>Données de localisation :</strong> adresse résidentielle complète, données GPS lors de la prestation (avec consentement explicite) ;</Li>
            <Li><strong>Données photographiques :</strong> photo de profil, photos avant/après des prestations, documents d'identité (Prestataires uniquement) ;</Li>
            <Li><strong>Données de paiement :</strong> informations de carte bancaire traitées via Stripe Inc. (PCI DSS Level 1 — Vesta Home ne stocke pas les données de carte) ;</Li>
            <Li><strong>Données d'utilisation :</strong> historique des réservations, évaluations, messages échangés via la Plateforme ;</Li>
            <Li><strong>Données techniques :</strong> adresse IP, type de navigateur, identifiants de session (à des fins de sécurité et d'analytique, avec consentement).</Li>
          </ul>
        </Section>

        <Section title="3. Finalités du traitement">
          <P>Vos renseignements personnels sont collectés et utilisés <strong>uniquement</strong> aux fins suivantes :</P>
          <ul style={{ paddingLeft: 20 }}>
            <Li>Création et gestion de votre compte utilisateur ;</Li>
            <Li>Mise en relation entre Clients et Prestataires ;</Li>
            <Li>Traitement et suivi des réservations et paiements ;</Li>
            <Li>Vérification d'identité et contrôle qualité des Prestataires ;</Li>
            <Li>Communication relative à vos réservations (confirmations, rappels, notifications) ;</Li>
            <Li>Amélioration de la Plateforme (analytique anonymisée, avec consentement) ;</Li>
            <Li>Respect de nos obligations légales et réglementaires.</Li>
          </ul>
          <P>Aucune donnée n'est utilisée à des fins de publicité ciblée sans votre consentement explicite.</P>
        </Section>

        <Section title="4. Partage des renseignements personnels">
          <P>Vesta Home ne vend jamais vos renseignements personnels à des tiers.</P>
          <P>Vos données peuvent être partagées dans les situations strictement limitées suivantes :</P>
          <ul style={{ paddingLeft: 20 }}>
            <Li><strong>Prestataire assigné :</strong> votre prénom, adresse de service et instructions particulières sont communiqués au seul Prestataire acceptant votre réservation ;</Li>
            <Li><strong>Stripe Inc. :</strong> traitement sécurisé des paiements ;</Li>
            <Li><strong>Cloudinary Inc. :</strong> hébergement sécurisé des photos de profil et des photos de prestation ;</Li>
            <Li><strong>Google Firebase :</strong> infrastructure d'authentification et base de données sécurisée ;</Li>
            <Li><strong>Autorités compétentes :</strong> uniquement sur ordonnance judiciaire ou obligation légale.</Li>
          </ul>
          <P>Tous nos sous-traitants sont contractuellement tenus de respecter des normes de protection des données équivalentes aux exigences de la Loi 25.</P>
        </Section>

        <Section title="5. Durée de conservation">
          <P>Vos renseignements personnels sont conservés aussi longtemps que votre compte est actif ou que nécessaire pour fournir nos services.</P>
          <P>En cas de suppression de compte à votre demande, l'ensemble de vos données personnelles est supprimé dans un délai de <strong>30 jours</strong>, à l'exception des données que nous sommes légalement tenus de conserver (données de transaction à des fins comptables et fiscales, conservées 7 ans conformément à la Loi sur les impôts du Québec).</P>
        </Section>

        <Section title="6. Vos droits">
          <P>Conformément à la Loi 25 du Québec, vous disposez des droits suivants :</P>
          <ul style={{ paddingLeft: 20 }}>
            <Li><strong>Droit d'accès :</strong> obtenir une copie de tous les renseignements personnels que nous détenons sur vous ;</Li>
            <Li><strong>Droit de rectification :</strong> faire corriger toute information inexacte ou incomplète ;</Li>
            <Li><strong>Droit à l'effacement :</strong> demander la suppression de vos renseignements personnels ;</Li>
            <Li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré et lisible par machine ;</Li>
            <Li><strong>Droit d'opposition :</strong> vous opposer à certains traitements, notamment à des fins de prospection ;</Li>
            <Li><strong>Droit de retirer votre consentement :</strong> à tout moment, sans préjudice des traitements effectués avant ce retrait.</Li>
          </ul>
          <P>Pour exercer vos droits, contactez notre responsable de la protection des renseignements personnels à : <span style={{ color: 'var(--brown)' }}>admin@vestahome.ca</span></P>
          <P>Nous répondrons à votre demande dans un délai de 30 jours. En cas de refus, nous vous en informerons avec les motifs et les recours disponibles.</P>
          <P>Vous pouvez également déposer une plainte auprès de la <strong>Commission d'accès à l'information du Québec (CAI)</strong> si vous estimez que vos droits n'ont pas été respectés.</P>
        </Section>

        <Section title="7. Cookies et technologies de traçage">
          <P>Vesta Home utilise des cookies de deux types :</P>
          <ul style={{ paddingLeft: 20 }}>
            <Li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement de la Plateforme (authentification, session). Ces cookies sont déposés sans consentement préalable car indispensables au service ;</Li>
            <Li><strong>Cookies analytiques :</strong> permettent de mesurer l'utilisation de la Plateforme et d'améliorer l'expérience utilisateur. Ces cookies ne sont déposés qu'avec votre <strong>consentement explicite</strong>, conformément à la Loi 25.</Li>
          </ul>
          <P>Vous pouvez à tout moment retirer votre consentement aux cookies analytiques en cliquant sur « Gérer les cookies » en bas de la Plateforme, ou en vidant les données de votre navigateur.</P>
        </Section>

        <Section title="8. Sécurité des données">
          <P>Vesta Home met en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos renseignements personnels contre tout accès non autorisé, perte, destruction ou divulgation :</P>
          <ul style={{ paddingLeft: 20 }}>
            <Li>Chiffrement des données en transit (TLS 1.3) et au repos ;</Li>
            <Li>Authentification sécurisée via Google Firebase Authentication ;</Li>
            <Li>Accès aux données limité aux seuls employés et sous-traitants en ayant besoin ;</Li>
            <Li>Audits de sécurité réguliers.</Li>
          </ul>
          <P>En cas d'incident de confidentialité susceptible de causer un préjudice sérieux, nous notifierons les personnes concernées et la CAI dans les délais prévus par la Loi 25.</P>
        </Section>

        <Section title="9. Modifications de la politique">
          <P>Vesta Home se réserve le droit de modifier la présente politique à tout moment. Toute modification substantielle sera notifiée par courriel au moins 30 jours avant son entrée en vigueur. La poursuite de l'utilisation de la Plateforme après cette période vaudra acceptation des modifications.</P>
        </Section>

        <div style={{ background: 'var(--bg-section)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', marginTop: 48 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Pour toute question relative à la protection de vos renseignements personnels, contactez-nous à <span style={{ color: 'var(--brown)', fontWeight: 600 }}>admin@vestahome.ca</span>.
            Nous nous engageons à traiter votre demande dans un délai de 30 jours.
          </p>
        </div>

      </div>
    </div>
  )
}
