import db from './db'

// 1. 商品分類與精選圖庫模板
const BASE_CATALOG = [
  {
    catId: 'watches_gifts',
    catName: '鐘錶禮品',
    titles: ['Classic Chrono Watch', 'Minimalist Mesh Watch', 'Aviator Pilot Watch', 'Smart Fitness Watch', 'Vintage Quartz Watch'],
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80'
    ],
    basePrice: 150
  },
  {
    catId: 'computers_accessories',
    catName: '電腦 3C',
    titles: ['RGB Mechanical Keyboard', 'Precision Wireless Mouse', 'ANC Wireless Headphone', 'USB-C Aluminum Hub', 'Ultra-wide Gaming Mousepad'],
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80'
    ],
    basePrice: 120
  },
  {
    catId: 'health_beauty',
    catName: '美妝個護',
    titles: ['Botanical Skin Serum', 'Maracujá Cold-Pressed Oil', 'Mineral SPF50+ Sunscreen', 'Revitalizing Night Cream', 'Organic Body Scrub'],
    images: [
      'https://images.unsplash.com/photo-1608248597359-0a9ef223f6e8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80'
    ],
    basePrice: 65
  },
  {
    catId: 'bed_bath_table',
    catName: '居家寢具',
    titles: ['Pure Linen 4-Piece Bed Set', 'Egyptian Cotton Towel Set', 'Natural Soy Candle', 'Ergonomic Memory Pillow', 'Boho Cotton Throw Blanket'],
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80'
    ],
    basePrice: 110
  },
  {
    catId: 'sports_leisure',
    catName: '運動休閒',
    titles: ['Pro Match Football', 'Eco Non-Slip Yoga Mat', 'Stainless Thermal Bottle', 'Speed Jump Rope', 'Adjustable Dumbbell Set'],
    images: [
      'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80'
    ],
    basePrice: 85
  },
  {
    catId: 'housewares',
    catName: '生活廚用',
    titles: ['Cast Iron Skillet 26cm', 'Glass French Press 1L', 'Stainless Chef Knife 8-inch', 'Non-stick Baking Pan', 'Ceramic Dinner Set'],
    images: [
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&w=600&q=80'
    ],
    basePrice: 95
  },
  {
    catId: 'auto',
    catName: '汽車配件',
    titles: ['4K UHD Dash Cam', 'Cordless Car Vacuum 9000Pa', 'Bluetooth FM Transmitter', 'Magnetic Phone Car Mount', 'Tire Pressure Gauge Pro'],
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80'
    ],
    basePrice: 130
  }
]

// 買家評語庫模板
const REVIEW_TEMPLATES = [
  { score: 5, comment: '出貨速度極快，包裝完整扎實，商品質感遠超預期！' },
  { score: 5, comment: '實品與照片完全一致，做工細緻，非常滿意這次的購物體驗。' },
  { score: 4, comment: '性價比非常高，操作簡單直覺，值得推薦給身邊朋友。' },
  { score: 5, comment: '巴西直送品質果然有保證，材質觸感極佳，會再次回購！' },
  { score: 4, comment: '物流配送效率很高，客服回覆也很有耐心。' }
]

// 2. 執行灌庫作業
function runSeed() {
  console.log('🌱 正在向 SQLite (olist.db) 注入種子資料...')

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO products (
      product_id, category_id, category_name_en, title, description,
      price, image_url, weight_g, length_cm, height_cm, width_cm,
      rating_avg, review_count, reviews_json
    ) VALUES (
      @product_id, @category_id, @category_name_en, @title, @description,
      @price, @image_url, @weight_g, @length_cm, @height_cm, @width_cm,
      @rating_avg, @review_count, @reviews_json
    )
  `)

  let count = 0
  let idCounter = 100

  const seedTransaction = db.transaction(() => {
    BASE_CATALOG.forEach((cat) => {
      cat.titles.forEach((titleBase, idx) => {
        const variants = ['Standard Edition', 'Pro Max', 'Series Elite', 'Special Carbon']

        variants.forEach((v, vIdx) => {
          idCounter++
          count++
          const pId = `olist_${cat.catId.slice(0, 3)}_${idCounter}`
          const price = Number((cat.basePrice * (0.8 + Math.random() * 1.5) + vIdx * 25).toFixed(2))
          const rating = Number((4.3 + Math.random() * 0.69).toFixed(1))
          const reviewCount = Math.floor(25 + Math.random() * 450)
          const img = cat.images[(idx + vIdx) % cat.images.length]

          // 隨機抽選 2~3 則評論
          const sampleReviews = [
            {
              review_id: `r_${pId}_1`,
              score: REVIEW_TEMPLATES[(idCounter + 1) % REVIEW_TEMPLATES.length].score,
              comment: REVIEW_TEMPLATES[(idCounter + 1) % REVIEW_TEMPLATES.length].comment,
              date: '2026-03-15'
            },
            {
              review_id: `r_${pId}_2`,
              score: REVIEW_TEMPLATES[(idCounter + 2) % REVIEW_TEMPLATES.length].score,
              comment: REVIEW_TEMPLATES[(idCounter + 2) % REVIEW_TEMPLATES.length].comment,
              date: '2026-02-28'
            },
            {
              review_id: `r_${pId}_3`,
              score: REVIEW_TEMPLATES[(idCounter + 3) % REVIEW_TEMPLATES.length].score,
              comment: REVIEW_TEMPLATES[(idCounter + 3) % REVIEW_TEMPLATES.length].comment,
              date: '2026-01-20'
            }
          ]

          insertStmt.run({
            product_id: pId,
            category_id: cat.catId,
            category_name_en: cat.catName,
            title: `Olist ${titleBase} - ${v} #${idCounter}`,
            description: `巴西原廠直供 ${cat.catName} 系列特選商品（${v}）。嚴選材質與精工製造，符合國際出口標準與耐久度認證。`,
            price,
            image_url: img,
            weight_g: Math.floor(180 + Math.random() * 1800),
            length_cm: Math.floor(12 + Math.random() * 30),
            height_cm: Math.floor(6 + Math.random() * 18),
            width_cm: Math.floor(10 + Math.random() * 22),
            rating_avg: rating,
            review_count: reviewCount,
            reviews_json: JSON.stringify(sampleReviews)
          })
        })
      })
    })
  })

  seedTransaction()

  console.log(`🎉 種子資料注入完成！共寫入 ${count} 筆高品質商品至 olist.db 資料庫。`)
}

runSeed()