import React from 'react';
import { cmsFaqOverrides } from './faq.generated.js';

const listClass = 'mt-3 list-disc pl-5 space-y-2 text-gray-700';

// Convert CMS FAQ section data into the same format as hardcoded sections
function buildCmsSections(locale) {
  const localeData = cmsFaqOverrides[locale];
  if (!localeData) return [];
  return Object.entries(localeData).map(([sectionKey, section]) => ({
    id: sectionKey,
    shortTitle: section.shortTitle || section.title,
    title: section.title,
    items: (section.items || []).map((item) => ({
      q: item.q,
      a: <>{item.a}</>,
    })),
  }));
}

const SECTIONS_EN = [
  {
    id: 'partnership-wholesale',
    shortTitle: 'Partnership',
    title: 'Partnership & Wholesale',
    items: [
      {
        q: 'How do I become a distributor or wholesale partner?',
        a: (
          <>
            We work with long-term partners with established sales channels. Share your market, sales plan, and target product categories, and our B2B team will help you define the best OEM/ODM or wholesale program for your customers.
          </>
        ),
      },
      {
        q: 'Do you offer exclusive distribution?',
        a: (
          <>
            In some markets, we can discuss regional exclusivity for qualified partners. Final terms depend on your sales performance, promotion plan, and order forecast.
          </>
        ),
      },
      {
        q: 'How do you support partners with marketing and launch?',
        a: (
          <>
            We support partner programs through dedicated account management, technical guidance, and customized branding options. If you have a launch schedule, share it with us during inquiry so we can align sampling, documentation, and supply planning.
          </>
        ),
      },
      {
        q: 'What makes your B2B offer different from a retail supplier?',
        a: (
          <>
            Retail focuses on single-item sales, while B2B focuses on repeatable supply and consistent customer delivery. We combine OEM/ODM flexibility, structured testing, and production capacity to support distribution and private label programs.
          </>
        ),
      },
    ],
  },
  {
    id: 'oem-odm',
    shortTitle: 'OEM/ODM',
    title: 'OEM & ODM Services',
    items: [
      {
        q: 'What is the difference between OEM and ODM?',
        a: (
          <>
            <strong>OEM</strong>: You provide the design and specifications; we manufacture accordingly.
            <br />
            <strong>ODM</strong>: You select from our existing, proven models; we customize branding, packaging, and relevant configurations to match your market needs.
          </>
        ),
      },
      {
        q: 'Can you customize branding (logo, packaging, colors)?',
        a: (
          <>
            Yes. For OEM/ODM projects we support branding customization, including your logo, packaging, and color schemes. We also help align the product presentation to your market requirements.
          </>
        ),
      },
      {
        q: 'What is your OEM/ODM workflow?',
        a: (
          <>
            Our workflow is designed to reduce iteration and improve clarity:
            <ul className={listClass}>
              <li>Inquiry & consultation (requirements, quantity, and market)</li>
              <li>Solution & quotation (program scope and sample plan)</li>
              <li>Design & sampling (finalize branding and key specifications)</li>
              <li>Mass production (after sample confirmation and agreement)</li>
              <li>QC & delivery (tested before shipment)</li>
            </ul>
          </>
        ),
      },
      {
        q: 'How do you protect IP and confidentiality?',
        a: (
          <>
            For OEM/ODM projects, we can work under confidentiality agreements during sampling and development stages. Share your requirements during inquiry and our B2B team will advise the next steps.
          </>
        ),
      },
    ],
  },
  {
    id: 'manufacturing-quality',
    shortTitle: 'Quality',
    title: 'Manufacturing, Quality & Compliance',
    items: [
      {
        q: 'How do you ensure waterproof quality?',
        a: (
          <>
            We validate performance with multiple test protocols, including:
            <ul className={listClass}>
              <li>Saltwater corrosion resistance: 72 hours of continuous saltwater spray exposure at 35°C</li>
              <li>Pressure testing: submerged testing in a pressure chamber simulating 3–5 meters for 30 minutes</li>
              <li>Durability stress testing: drop, vibration, and temperature cycling verification</li>
              <li>Battery performance verification and reliability checks</li>
              <li>Acoustic quality assurance to ensure audio is not compromised</li>
            </ul>
            Testing is part of our lab validation process before products reach customers.
          </>
        ),
      },
      {
        q: 'What certifications and standards do you support?',
        a: (
          <>
            Our products are aligned with international standards and testing readiness, including:
            <ul className={listClass}>
              <li>Waterproof performance: IPX7 / IPX8</li>
              <li>Environmental & safety: CE, FCC, RoHS, REACH</li>
            </ul>
            Third-party verification is used to ensure accuracy of testing results.
          </>
        ),
      },
      {
        q: 'Can you handle large volume production?',
        a: (
          <>
            Yes. We support scalable programs with production capacity exceeding <strong>250,000 units per month</strong>, and we help partners plan orders according to their market rollout schedule.
          </>
        ),
      },
      {
        q: 'What is your battery and reliability validation process?',
        a: (
          <>
            We verify battery performance with continuous playback testing under controlled environments, measure actual battery life against specifications, and validate charging cycle longevity. Our validation also includes battery-related certifications readiness such as IEC 62133 and UN 38.3.
          </>
        ),
      },
    ],
  },
  {
    id: 'orders-payments',
    shortTitle: 'Orders & Terms',
    title: 'Orders, Payments & Logistics',
    items: [
      {
        q: 'What is the MOQ for wholesale and private label?',
        a: (
          <>
            For wholesale and private label programs, our MOQ is typically <strong>over 1,000 pcs per model</strong>. OEM/ODM quantities may vary depending on customization scope and sampling requirements. Share your target quantity during inquiry for a tailored recommendation.
          </>
        ),
      },
      {
        q: 'What payment terms do you offer?',
        a: (
          <>
            For qualified partners, we can offer <strong>Net 30/60</strong> payment terms. Drop shipping may be available depending on the project scope.
          </>
        ),
      },
      {
        q: 'How long is the lead time?',
        a: (
          <>
            Lead time depends on the project complexity, sample plan, and order quantity. After we review your requirements, our B2B team will confirm a production schedule in the quotation.
          </>
        ),
      },
      {
        q: 'Do you support trade terms like FOB?',
        a: (
          <>
            Trade terms can be discussed during quotation and confirmed according to your destination and logistics plan. Share your preferred Incoterm during inquiry and we will align accordingly.
          </>
        ),
      },
    ],
  },
  {
    id: 'support',
    shortTitle: 'Support',
    title: 'General Inquiries & End-User Guidance',
    items: [
      {
        q: 'I’m not a business. Where can I buy?',
        a: (
          <>
            If you’re looking for one unit or consumer purchase, please contact us via the inquiry form so we can guide you to appropriate purchase channels in your region.
          </>
        ),
      },
      {
        q: 'What should I do if I need product support or warranty service?',
        a: (
          <>
            For the fastest support, please contact the original seller or retailer where you purchased the product. They can process warranty claims or help with service requests according to local policies.
          </>
        ),
      },
      {
        q: 'How quickly will you respond to my inquiry?',
        a: (
          <>
            Our B2B team typically contacts partners within <strong>24 hours</strong> after a submitted inquiry.
          </>
        ),
      },
    ],
  },
];

const SECTIONS_FR = [
  {
    id: 'partnership-wholesale',
    shortTitle: 'Partenariat',
    title: 'Partenariat & grossiste',
    items: [
      {
        q: 'Comment devenir distributeur ou partenaire grossiste ?',
        a: (
          <>
            Nous travaillons avec des partenaires sur le long terme disposant de canaux de vente établis. Indiquez votre marché, votre plan commercial et vos catégories cibles : notre équipe B2B vous aidera à définir le programme OEM/ODM ou grossiste le plus adapté à vos clients.
          </>
        ),
      },
      {
        q: 'Proposez-vous une distribution exclusive ?',
        a: (
          <>
            Sur certains marchés, nous pouvons étudier une exclusivité régionale pour des partenaires qualifiés. Les conditions finales dépendent de vos performances commerciales, de votre plan promotionnel et de vos prévisions de commandes.
          </>
        ),
      },
      {
        q: 'Comment accompagnez-vous les partenaires sur le marketing et le lancement ?',
        a: (
          <>
            Nous accompagnons les programmes partenaires via un interlocuteur dédié, un appui technique et des options de personnalisation de marque. Si vous avez un calendrier de lancement, communiquez-le lors de la demande afin d’aligner échantillons, documentation et plan d’approvisionnement.
          </>
        ),
      },
      {
        q: 'En quoi votre offre B2B diffère-t-elle d’un fournisseur retail ?',
        a: (
          <>
            Le retail vise la vente à l’unité, tandis que le B2B repose sur une supply récurrente et une livraison client fiable. Nous combinons flexibilité OEM/ODM, essais structurés et capacité de production pour soutenir la distribution et le private label.
          </>
        ),
      },
    ],
  },
  {
    id: 'oem-odm',
    shortTitle: 'OEM/ODM',
    title: 'Services OEM & ODM',
    items: [
      {
        q: 'Quelle est la différence entre OEM et ODM ?',
        a: (
          <>
            <strong>OEM</strong> : vous fournissez la conception et les spécifications ; nous fabriquons en conséquence.
            <br />
            <strong>ODM</strong> : vous choisissez parmi nos modèles éprouvés ; nous personnalisons marque, packaging et configurations pour correspondre à votre marché.
          </>
        ),
      },
      {
        q: 'Pouvez-vous personnaliser la marque (logo, packaging, couleurs) ?',
        a: (
          <>
            Oui. Pour les projets OEM/ODM, nous prenons en charge la personnalisation (logo, packaging, gammes de couleurs) et adaptons la présentation produit aux exigences de votre marché.
          </>
        ),
      },
      {
        q: 'Quel est votre processus OEM/ODM ?',
        a: (
          <>
            Notre processus vise à limiter les allers-retours et clarifier les étapes :
            <ul className={listClass}>
              <li>Demande & consultation (besoins, quantités, marché)</li>
              <li>Solution & devis (périmètre du programme et plan d’échantillons)</li>
              <li>Conception & échantillons (validation marque et spécifications clés)</li>
              <li>Production de série (après validation des échantillons et accord)</li>
              <li>QC & expédition (contrôles avant envoi)</li>
            </ul>
          </>
        ),
      },
      {
        q: 'Comment protégez-vous la propriété intellectuelle et la confidentialité ?',
        a: (
          <>
            Pour les projets OEM/ODM, nous pouvons travailler sous accords de confidentialité pendant les phases d’échantillonnage et de développement. Précisez vos exigences lors de la demande : notre équipe B2B vous indiquera la suite.
          </>
        ),
      },
    ],
  },
  {
    id: 'manufacturing-quality',
    shortTitle: 'Qualité',
    title: 'Fabrication, qualité & conformité',
    items: [
      {
        q: 'Comment garantissez-vous la qualité d’étanchéité ?',
        a: (
          <>
            Nous validons les performances via plusieurs protocoles, notamment :
            <ul className={listClass}>
              <li>Résistance à la corrosion saline : 72 h de brouillard salin continu à 35 °C</li>
              <li>Essais en pression : immersion en chambre simulant 3 à 5 m pendant 30 minutes</li>
              <li>Essais de robustesse : chutes, vibrations et cycles thermiques</li>
              <li>Vérification de l’autonomie batterie et fiabilité</li>
              <li>Contrôle acoustique pour préserver la qualité audio</li>
            </ul>
            Ces essais s’inscrivent dans notre validation laboratoire avant livraison aux clients.
          </>
        ),
      },
      {
        q: 'Quelles certifications et normes couvrez-vous ?',
        a: (
          <>
            Nos produits visent des standards internationaux et une préparation aux essais, incluant :
            <ul className={listClass}>
              <li>Étanchéité : IPX7 / IPX8</li>
              <li>Environnement & sécurité : CE, FCC, RoHS, REACH</li>
            </ul>
            Des vérifications tierces assurent la fiabilité des résultats.
          </>
        ),
      },
      {
        q: 'Pouvez-vous gérer de gros volumes ?',
        a: (
          <>
            Oui. Nous soutenons des programmes évolutifs avec une capacité dépassant <strong>250 000 unités par mois</strong>, et aidons à planifier les commandes selon votre calendrier de déploiement.
          </>
        ),
      },
      {
        q: 'Comment validez-vous la batterie et la fiabilité ?',
        a: (
          <>
            Nous vérifions l’autonomie par des tests d’écoute en environnement contrôlé, comparons aux spécifications et validons la durée de vie des cycles de charge. La validation inclut aussi la préparation aux certifications batterie telles qu’IEC 62133 et UN 38.3.
          </>
        ),
      },
    ],
  },
  {
    id: 'orders-payments',
    shortTitle: 'Commandes',
    title: 'Commandes, paiements & logistique',
    items: [
      {
        q: 'Quel est le MOQ pour le grossiste et le private label ?',
        a: (
          <>
            Pour le grossiste et le private label, le MOQ est en général <strong>supérieur à 1 000 pcs par modèle</strong>. Les quantités OEM/ODM peuvent varier selon le niveau de personnalisation et le plan d’échantillons. Indiquez votre volume cible pour une recommandation adaptée.
          </>
        ),
      },
      {
        q: 'Quelles conditions de paiement proposez-vous ?',
        a: (
          <>
            Pour les partenaires qualifiés, nous pouvons proposer des délais <strong>Net 30/60</strong>. Le drop shipping peut être envisagé selon le projet.
          </>
        ),
      },
      {
        q: 'Quels sont les délais de production ?',
        a: (
          <>
            Les délais dépendent de la complexité du projet, du plan d’échantillons et des quantités. Après analyse de vos besoins, notre équipe B2B confirme un planning dans le devis.
          </>
        ),
      },
      {
        q: 'Supportez-vous des Incoterms comme le FOB ?',
        a: (
          <>
            Les conditions commerciales se discutent lors du devis et sont confirmées selon votre destination et votre logistique. Indiquez votre Incoterm préféré lors de la demande pour alignement.
          </>
        ),
      },
    ],
  },
  {
    id: 'support',
    shortTitle: 'Support',
    title: 'Questions générales & utilisateurs finaux',
    items: [
      {
        q: 'Je ne suis pas une entreprise. Où acheter ?',
        a: (
          <>
            Pour un achat à l’unité ou grand public, contactez-nous via le formulaire : nous vous orienterons vers les canaux adaptés à votre région.
          </>
        ),
      },
      {
        q: 'Comment obtenir du SAV ou une garantie ?',
        a: (
          <>
            Pour une prise en charge rapide, adressez-vous au vendeur ou au distributeur auprès duquel vous avez acheté le produit. Il pourra traiter la garantie ou les demandes selon les politiques locales.
          </>
        ),
      },
      {
        q: 'Quel délai de réponse après une demande ?',
        a: (
          <>
            Notre équipe B2B contacte généralement les partenaires sous <strong>24 h</strong> après réception de la demande.
          </>
        ),
      },
    ],
  },
];

const SECTIONS_VI = [
  {
    id: 'partnership-wholesale',
    shortTitle: 'Đối tác',
    title: 'Đối tác phân phối & bán sỉ',
    items: [
      {
        q: 'Làm sao để trở thành nhà phân phối hoặc đối tác bán sỉ?',
        a: (
          <>
            Chúng tôi hợp tác lâu dài với các đối tác đã có kênh bán ổn định. Hãy chia sẻ thị trường, kế hoạch kinh doanh và nhóm sản phẩm mục tiêu — đội ngũ B2B sẽ giúp bạn xác định chương trình OEM/ODM hoặc bán sỉ phù hợp nhất với khách hàng của bạn.
          </>
        ),
      },
      {
        q: 'Có hỗ trợ độc quyền khu vực không?',
        a: (
          <>
            Ở một số thị trường, chúng tôi có thể trao đổi độc quyền khu vực với đối tác đủ điều kiện. Điều khoản cuối cùng phụ thuộc hiệu suất bán hàng, kế hoạch quảng bá và dự báo đơn hàng của bạn.
          </>
        ),
      },
      {
        q: 'Bạn hỗ trợ đối tác marketing và ra mắt sản phẩm như thế nào?',
        a: (
          <>
            Chúng tôi hỗ trợ chương trình đối tác qua quản lý tài khoản, hướng dẫn kỹ thuật và tùy chọn thương hiệu. Nếu có lịch ra mắt, hãy gửi khi làm inquiry để chúng tôi phối hợp lấy mẫu, tài liệu và kế hoạch cung ứng.
          </>
        ),
      },
      {
        q: 'Ưu điểm B2B của bạn so với nhà cung cấp bán lẻ là gì?',
        a: (
          <>
            Bán lẻ tập trung vào từng đơn hàng lẻ, còn B2B tập trung vào nguồn cung ổn định và giao hàng nhất quán. Chúng tôi kết hợp linh hoạt OEM/ODM, kiểm thử có quy trình và năng lực sản xuất để hỗ trợ phân phối và private label.
          </>
        ),
      },
    ],
  },
  {
    id: 'oem-odm',
    shortTitle: 'OEM/ODM',
    title: 'Dịch vụ OEM & ODM',
    items: [
      {
        q: 'OEM và ODM khác nhau thế nào?',
        a: (
          <>
            <strong>OEM</strong>: Bạn cung cấp thiết kế và thông số; chúng tôi sản xuất theo đó.
            <br />
            <strong>ODM</strong>: Bạn chọn từ các model đã được kiểm chứng; chúng tôi tùy chỉnh thương hiệu, bao bì và cấu hình phù hợp thị trường.
          </>
        ),
      },
      {
        q: 'Có tùy chỉnh thương hiệu (logo, bao bì, màu) không?',
        a: (
          <>
            Có. Với dự án OEM/ODM, chúng tôi hỗ trợ logo, packaging và bảng màu, đồng thời căn chỉnh cách trình bày sản phẩm theo yêu cầu thị trường của bạn.
          </>
        ),
      },
      {
        q: 'Quy trình OEM/ODM của bạn ra sao?',
        a: (
          <>
            Quy trình giúp giảm vòng lặp và làm rõ từng bước:
            <ul className={listClass}>
              <li>Tiếp nhận & tư vấn (yêu cầu, số lượng, thị trường)</li>
              <li>Giải pháp & báo giá (phạm vi chương trình và kế hoạch mẫu)</li>
              <li>Thiết kế & làm mẫu (chốt branding và thông số chính)</li>
              <li>Sản xuất hàng loạt (sau khi xác nhận mẫu và thỏa thuận)</li>
              <li>QC & giao hàng (kiểm tra trước khi xuất)</li>
            </ul>
          </>
        ),
      },
      {
        q: 'Bảo vệ IP và bảo mật thông tin như thế nào?',
        a: (
          <>
            Với OEM/ODM, chúng tôi có thể làm việc theo thỏa thuận bảo mật trong giai đoạn làm mẫu và phát triển. Hãy mô tả yêu cầu khi gửi inquiry — đội B2B sẽ hướng dẫn bước tiếp theo.
          </>
        ),
      },
    ],
  },
  {
    id: 'manufacturing-quality',
    shortTitle: 'Chất lượng',
    title: 'Sản xuất, chất lượng & tuân thủ',
    items: [
      {
        q: 'Làm sao đảm bảo chất lượng chống nước?',
        a: (
          <>
            Chúng tôi kiểm chứng hiệu năng qua nhiều quy trình, gồm:
            <ul className={listClass}>
              <li>Kháng ăn mòn nước biển: phun sương muối liên tục 72 giờ ở 35°C</li>
              <li>Thử áp suất: ngâm trong buồng mô phỏng độ sâu 3–5 m trong 30 phút</li>
              <li>Thử độ bền: rơi, rung, và chu kỳ nhiệt</li>
              <li>Kiểm tra pin và độ tin cậy</li>
              <li>Đảm bảo chất lượng âm thanh</li>
            </ul>
            Các bước này là một phần quy trình lab trước khi giao cho khách hàng.
          </>
        ),
      },
      {
        q: 'Hỗ trợ chứng nhận và tiêu chuẩn nào?',
        a: (
          <>
            Sản phẩm hướng tới tiêu chuẩn quốc tế và sẵn sàng kiểm định, ví dụ:
            <ul className={listClass}>
              <li>Chống nước: IPX7 / IPX8</li>
              <li>Môi trường & an toàn: CE, FCC, RoHS, REACH</li>
            </ul>
            Bên thứ ba tham gia xác minh để đảm bảo kết quả đáng tin cậy.
          </>
        ),
      },
      {
        q: 'Có đáp ứng sản lượng lớn không?',
        a: (
          <>
            Có. Chúng tôi hỗ trợ chương trình mở rộng với năng lực vượt <strong>250.000 sản phẩm/tháng</strong>, đồng thời giúp lên kế hoạch đơn hàng theo lộ trình thị trường của bạn.
          </>
        ),
      },
      {
        q: 'Quy trình kiểm tra pin và độ tin cậy?',
        a: (
          <>
            Chúng tôi kiểm tra thời lượng phát trong môi trường kiểm soát, đối chiếu với thông số và kiểm tra tuổi thọ chu kỳ sạc. Quy trình cũng bao gồm sẵn sàng chứng nhận pin như IEC 62133 và UN 38.3 khi cần.
          </>
        ),
      },
    ],
  },
  {
    id: 'orders-payments',
    shortTitle: 'Đơn hàng',
    title: 'Đơn hàng, thanh toán & logistics',
    items: [
      {
        q: 'MOQ cho bán sỉ và private label là bao nhiêu?',
        a: (
          <>
            Thông thường MOQ từ <strong>trên 1.000 pcs mỗi model</strong> cho bán sỉ và private label. Số lượng OEM/ODM có thể thay đổi theo mức tùy chỉnh và kế hoạch mẫu. Hãy cho biết số lượng mục tiêu khi inquiry để được tư vấn phù hợp.
          </>
        ),
      },
      {
        q: 'Điều khoản thanh toán là gì?',
        a: (
          <>
            Với đối tác đủ điều kiện, có thể hỗ trợ <strong>Net 30/60</strong>. Drop shipping có thể áp dụng tùy phạm vi dự án.
          </>
        ),
      },
      {
        q: 'Lead time khoảng bao lâu?',
        a: (
          <>
            Lead time phụ thuộc độ phức tạp dự án, kế hoạch mẫu và số lượng. Sau khi xem xét yêu cầu, đội B2B sẽ xác nhận lịch sản xuất trong báo giá.
          </>
        ),
      },
      {
        q: 'Có hỗ trợ điều kiện thương mại như FOB không?',
        a: (
          <>
            Điều khoản thương mại được trao đổi khi báo giá và xác nhận theo điểm đến và kế hoạch logistics. Hãy ghi rõ Incoterm mong muốn khi gửi inquiry để chúng tôi phối hợp.
          </>
        ),
      },
    ],
  },
  {
    id: 'support',
    shortTitle: 'Hỗ trợ',
    title: 'Câu hỏi chung & người dùng cuối',
    items: [
      {
        q: 'Tôi không phải doanh nghiệp. Mua ở đâu?',
        a: (
          <>
            Nếu bạn cần mua lẻ hoặc mua với tư cách người tiêu dùng, hãy liên hệ qua form — chúng tôi sẽ hướng dẫn kênh phù hợp tại khu vực của bạn.
          </>
        ),
      },
      {
        q: 'Cần hỗ trợ sản phẩm hoặc bảo hành thì làm gì?',
        a: (
          <>
            Để xử lý nhanh, vui lòng liên hệ nhà bán lẻ hoặc đại lý nơi bạn mua sản phẩm. Họ có thể xử lý bảo hành hoặc yêu cầu dịch vụ theo chính sách địa phương.
          </>
        ),
      },
      {
        q: 'Bao lâu thì có phản hồi sau khi gửi yêu cầu?',
        a: (
          <>
            Đội B2B thường liên hệ đối tác trong vòng <strong>24 giờ</strong> sau khi nhận inquiry.
          </>
        ),
      },
    ],
  },
];

const BY_LOCALE = {
  en: SECTIONS_EN,
  fr: SECTIONS_FR,
  vi: SECTIONS_VI,
};

/**
 * Extended FAQ sections (below the procurement accordion). English is the source of truth.
 * Merges hardcoded sections with CMS-managed sections.
 */
export function getFaqExtendedSections(locale) {
  const hardcoded = BY_LOCALE[locale] ?? BY_LOCALE.en;
  const cmsSections = buildCmsSections(locale);
  return [...hardcoded, ...cmsSections];
}
