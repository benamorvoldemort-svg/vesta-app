import { useNavigate } from 'react-router-dom'

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 36 }}>
    <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, color: 'var(--brown)', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>{title}</h2>
    <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85 }}>{children}</div>
  </div>
)

const P = ({ children }) => <p style={{ marginBottom: 10 }}>{children}</p>
const Li = ({ children }) => <li style={{ marginBottom: 6, paddingLeft: 4 }}>{children}</li>

export default function CGUPage() {
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
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 40, fontWeight: 600, fontStyle: 'italic', marginBottom: 12 }}>Conditions Générales d'Utilisation</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Dernière mise à jour : 1er avril 2026 · En vigueur dès l'inscription</p>
        </div>

        <Section title="1. Présentation de Vesta Home">
          <P>Vesta Home (« la Plateforme ») est un service technologique de mise en relation exploité par Vesta Home Inc., société constituée selon les lois du Québec, Canada, avec siège social à Montréal (Québec).</P>
          <P>La Plateforme met en relation des clients résidentiels (« Clients ») et des professionnels de l'entretien ménager indépendants (« Prestataires ») pour la fourniture de services de nettoyage résidentiel.</P>
          <P><strong>Vesta Home n'est pas un employeur.</strong> Vesta Home agit exclusivement à titre d'intermédiaire technologique facilitant la rencontre entre l'offre et la demande. Vesta Home ne dirige pas, ne supervise pas et n'est pas responsable de l'exécution des services par les Prestataires.</P>
        </Section>

        <Section title="2. Statut des Prestataires">
          <P>Les Prestataires inscrits sur la Plateforme sont des travailleurs autonomes indépendants. À ce titre :</P>
          <ul style={{ paddingLeft: 20 }}>
            <Li>Ils sont seuls responsables de la déclaration et du paiement de leurs impôts et taxes applicables (TPS, TVQ, impôt sur le revenu) conformément aux lois fiscales fédérales et provinciales du Canada et du Québec ;</Li>
            <Li>Ils ne bénéficient d'aucune protection de l'emploi, d'aucun avantage social, ni d'aucune couverture d'assurance emploi de la part de Vesta Home ;</Li>
            <Li>Ils sont responsables de leur propre assurance responsabilité civile professionnelle ;</Li>
            <Li>Ils établissent librement leur disponibilité et peuvent refuser des missions sans justification.</Li>
          </ul>
          <P>Vesta Home se réserve le droit de vérifier l'identité et les antécédents des Prestataires avant leur activation sur la Plateforme.</P>
        </Section>

        <Section title="3. Commission et tarification">
          <P>Pour chaque transaction complétée via la Plateforme, Vesta Home prélève une commission de <strong>20 %</strong> sur le montant total de la prestation, à la charge du Prestataire.</P>
          <P>Les prix affichés aux Clients sont des prix toutes commissions comprises. Le Prestataire reçoit 80 % du montant de la transaction, déduction faite de la commission Vesta.</P>
          <P>Vesta Home se réserve le droit de modifier son taux de commission avec un préavis de 30 jours notifié par courriel.</P>
        </Section>

        <Section title="4. Politique d'annulation">
          <P>Les annulations effectuées par les Clients sont soumises à la politique suivante :</P>
          <ul style={{ paddingLeft: 20 }}>
            <Li><strong>Plus de 24 heures avant la prestation :</strong> remboursement intégral (100 %) sans frais ;</Li>
            <Li><strong>Entre 12 et 24 heures avant la prestation :</strong> remboursement partiel de 50 % du montant total ;</Li>
            <Li><strong>Moins de 12 heures avant la prestation :</strong> aucun remboursement. Le montant total est retenu.</Li>
          </ul>
          <P>En cas d'annulation à l'initiative du Prestataire, quelle que soit la raison et le délai, le Client est remboursé intégralement (100 %). Vesta Home s'engage à proposer une nouvelle mission de remplacement dans les meilleurs délais.</P>
          <P>Les remboursements sont traités dans un délai de 5 à 10 jours ouvrables selon le mode de paiement.</P>
        </Section>

        <Section title="5. Contestations et remboursements">
          <P>Tout Client insatisfait d'une prestation peut soumettre une contestation dans un délai de <strong>24 heures</strong> suivant la fin du service.</P>
          <P>La contestation doit être accompagnée obligatoirement de photographies documentant les manquements constatés, soumises via la Plateforme ou à l'adresse <span style={{ color: 'var(--brown)' }}>support@vestahome.ca</span>.</P>
          <P>Toute contestation soumise sans preuve photographique ou après le délai de 24 heures ne pourra être traitée.</P>
          <P>Vesta Home examine les contestations dans un délai de 3 jours ouvrables et détermine, à sa seule discrétion, si un remboursement partiel ou total est accordé.</P>
        </Section>

        <Section title="6. Dommages et vol">
          <P>Tout dommage matériel ou vol présumé survenu lors d'une prestation doit être signalé à Vesta Home dans un délai de <strong>24 heures</strong> suivant la fin du service, avec photographies à l'appui, à l'adresse <span style={{ color: 'var(--brown)' }}>support@vestahome.ca</span>.</P>
          <P>Vesta Home agit exclusivement à titre de <strong>médiateur</strong> entre le Client et le Prestataire concerné. Vesta Home n'assume aucune responsabilité directe pour les dommages causés par les Prestataires, ces derniers étant des travailleurs indépendants.</P>
          <P>Il est fortement conseillé aux Clients de souscrire une assurance habitation couvrant les dommages causés par des tiers prestataires de services.</P>
        </Section>

        <Section title="7. Système d'avis et évaluations">
          <P>Seuls les Clients ayant complété une réservation vérifiée sur la Plateforme sont autorisés à laisser un avis sur le Prestataire concerné.</P>
          <P>Les avis doivent être honnêtes, factuels et respectueux. Vesta Home se réserve le droit de supprimer tout avis jugé frauduleux, diffamatoire ou contraire aux présentes conditions.</P>
          <P>Tout Prestataire dont la note moyenne est inférieure à <strong>3,5 étoiles</strong> après avoir reçu un minimum de 10 avis vérifiés est automatiquement suspendu de la Plateforme dans l'attente d'une révision de son dossier.</P>
        </Section>

        <Section title="8. Limitation de responsabilité">
          <P>Vesta Home fournit la Plateforme « en l'état » à titre de service technologique. Dans toute la mesure permise par la loi applicable, Vesta Home ne peut être tenu responsable :</P>
          <ul style={{ paddingLeft: 20 }}>
            <Li>De la qualité ou de la conformité des services fournis par les Prestataires ;</Li>
            <Li>Des dommages directs, indirects, accessoires ou consécutifs résultant de l'utilisation de la Plateforme ;</Li>
            <Li>Des interruptions de service dues à des causes hors de son contrôle ;</Li>
            <Li>Des actes ou omissions des Prestataires dans le cadre de leurs prestations.</Li>
          </ul>
          <P>La responsabilité totale de Vesta Home, quelle qu'en soit la cause, ne saurait excéder le montant des frais de service perçus au cours des 3 derniers mois précédant l'événement donnant lieu à responsabilité.</P>
        </Section>

        <Section title="9. Droit applicable et juridiction">
          <P>Les présentes Conditions Générales d'Utilisation sont régies et interprétées conformément aux lois de la province de <strong>Québec</strong> et aux lois fédérales du <strong>Canada</strong> applicables.</P>
          <P>Tout litige découlant des présentes conditions sera soumis à la compétence exclusive des tribunaux de la province de Québec, district judiciaire de Montréal.</P>
          <P>Pour toute question relative aux présentes conditions, contactez-nous à : <span style={{ color: 'var(--brown)' }}>legal@vestahome.ca</span></P>
        </Section>

        <div style={{ background: 'var(--bg-section)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', marginTop: 48 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            En créant un compte ou en utilisant la Plateforme Vesta Home, vous reconnaissez avoir lu, compris et accepté l'intégralité des présentes Conditions Générales d'Utilisation.
          </p>
        </div>

      </div>
    </div>
  )
}
