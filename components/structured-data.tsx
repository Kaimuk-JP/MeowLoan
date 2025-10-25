export function OrganizationSchema() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SETStudentLoan",
    url: "https://setstudentloan.vercel.app",
    logo: "https://setstudentloan.vercel.app/logo.png",
    description: "บริการรับจ้างเก็บชั่วโมงจิตอาสาออนไลน์และกรอกข้อมูลลงระบบ",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "Thai",
    },
    sameAs: ["https://line.me/ti/p/6JSq5f9K0-"],
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
}

export function ServiceSchema() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "บริการเก็บชั่วโมงจิตอาสาออนไลน์",
    provider: {
      "@type": "Organization",
      name: "SETStudentLoan",
      url: "https://setstudentloan.vercel.app",
    },
    description: "บริการรับจ้างเก็บชั่วโมงจิตอาสาออนไลน์และกรอกข้อมูลลงระบบ ง่าย สะดวก รวดเร็ว",
    offers: [
      {
        "@type": "Offer",
        name: "บริการรายชั่วโมง",
        price: "7",
        priceCurrency: "THB",
        description: "1-15 ชั่วโมง: ชั่วโมงละ 7 บาท",
        url: "https://setstudentloan.vercel.app/#services",
      },
      {
        "@type": "Offer",
        name: "บริการรายชั่วโมง",
        price: "6",
        priceCurrency: "THB",
        description: "15-36 ชั่วโมง: ชั่วโมงละ 6 บาท",
        url: "https://setstudentloan.vercel.app/#services",
      },
      {
        "@type": "Offer",
        name: "แพ็คเกจ 36 ชั่วโมง",
        price: "150",
        priceCurrency: "THB",
        description: "แพ็คเกจ 36 ชั่วโมง ประหยัดกว่า 42% จากราคาปกติ",
        url: "https://setstudentloan.vercel.app/#services",
      },
      {
        "@type": "Offer",
        name: "บริการกรอกข้อมูล",
        price: "50",
        priceCurrency: "THB",
        description: "บริการกรอกข้อมูลลงระบบให้เรียบร้อย",
        url: "https://setstudentloan.vercel.app/#services",
      },
    ],
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
}

export function FAQSchema() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "บริการเก็บชั่วโมงจิตอาสาออนไลน์คืออะไร?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "บริการเก็บชั่วโมงจิตอาสาออนไลน์คือบริการที่ช่วยให้นักศึกษาที่กู้ยืม กยศ. สามารถเก็บชั่วโมงจิตอาสาได้ครบตามที่กำหนด โดยไม่ต้องเสียเวลาไปทำกิจกรรมด้วยตนเอง",
        },
      },
      {
        "@type": "Question",
        name: "ราคาค่าบริการเท่าไหร่?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "บริการรายชั่วโมง: 1-15 ชั่วโมง ราคาชั่วโมงละ 7 บาท, 15-36 ชั่วโมง ราคาชั่วโมงละ 6 บาท, แพ็คเกจ 36 ชั่วโมง ราคา 150 บาท (ประหยัดกว่า 42%), บริการกรอกข้อมูลลงระบบ ราคา 50 บาท",
        },
      },
      {
        "@type": "Question",
        name: "ใช้เวลานานแค่ไหนในการดำเนินการ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "เราดำเนินการภายใน 24 ชั่วโมงหลังจากได้รับการชำระเงิน และงานจะเสร็จภายใน 1-3 วัน",
        },
      },
      {
        "@type": "Question",
        name: "มีการรับประกันผลงานหรือไม่?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "เรารับประกันผลงาน 100% หากไม่พอใจหรือมีปัญหา เราพร้อมแก้ไขให้จนกว่าจะพอใจ",
        },
      },
    ],
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
}
