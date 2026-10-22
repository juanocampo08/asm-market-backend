import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from '../src/infrastructure/repository/client.ts';

const productosIniciales = [
  {
    nombre: "Nature's Truth Restore & Unwind Ashwagandha Gummies",
    categoria: 'Vitaminas',
    precio: 90000,
    descripcion:
      'Gomitas masticables con extracto de ashwagandha y sabor tropical. Ayudan a relajar la mente, reducir el estrés y promover el descanso.',
    imagen: '/assets/images/Ashwagandha-Gummies.jpg',
  },
  {
    nombre: 'KOO2 by Sprinter Advanced Skin Hydration Mix',
    categoria: 'Vitaminas',
    precio: 160000,
    descripcion:
      'Mezcla hidratante en sobres con electrolitos, péptidos de colágeno Verisol y ácido hialurónico. Mejora la elasticidad de la piel y reduce arrugas.',
    imagen: '/assets/images/Electrolitos.JPEG',
  },
  {
    nombre: 'Truly Mango Margs Exfoliating Body Scrub',
    categoria: 'Beauty',
    precio: 75000,
    descripcion:
      'Exfoliante corporal formulado con sal marina y notas de mango y piña. Elimina impurezas y células muertas dejando la piel suave y renovada.',
    imagen: '/assets/images/Exfoliante-Truly.JPEG',
  },
  {
    nombre: 'Nature Made Burp-Less Fish Oil 1200 mg',
    categoria: 'Vitaminas',
    precio: 135000,
    descripcion:
      'Suplemento de aceite de pescado con 360 mg de Omega-3 purificado para eliminar el mercurio. Apoya la salud cardiovascular sin dejar sabor a pescado.',
    imagen: '/assets/images/FishOil-NatureMade.JPEG',
  },
  {
    nombre: "Nature's Bounty Hair, Skin & Nails Softgels Extra Strength",
    categoria: 'Vitaminas',
    precio: 120000,
    descripcion:
      'Cápsulas líquidas de máxima potencia con 5,000 mcg de biotina y aceite de argán. Fortalecen el cabello, la piel y las uñas desde el interior.',
    imagen: '/assets/images/Hair-Nail-Skin-Softgels.JPEG',
  },
  {
    nombre: 'Nature Made Iron 65 mg',
    categoria: 'Vitaminas',
    precio: 70000,
    descripcion:
      'Suplemento de hierro esencial para la formación de glóbulos rojos. Ayuda a combatir la deficiencia de hierro y a mantener los niveles de energía.',
    imagen: '/assets/images/Iron-NatureMade.JPEG',
  },
  {
    nombre: "Nature's Bounty High Absorption Magnesium Glycinate 240 mg",
    categoria: 'Vitaminas',
    precio: 110000,
    descripcion:
      'Glicinato de magnesio de alta absorción que promueve la relajación muscular y apoya la salud de los huesos, corazón y sistema nervioso.',
    imagen: '/assets/images/Magnesio.JPEG',
  },
  {
    nombre: 'Medias Tobilleras Nike Blancas',
    categoria: 'Fashion',
    precio: 40000,
    descripcion:
      'Medias tobilleras deportivas de algodón en color blanco con el logo de Nike. Brindan ajuste cómodo, suavidad y transpirabilidad diarias.',
    imagen: '/assets/images/Medias.JPEG',
  },
  {
    nombre: "Nature's Bounty Melatonin 10 mg Twin Pack",
    categoria: 'Vitaminas',
    precio: 100000,
    descripcion:
      'Paquete doble de melatonina de 10 mg libre de drogas. Ayuda a conciliar el sueño más rápido y favorece un descanso nocturno reparador.',
    imagen: '/assets/images/Melatonina-10mg.JPEG',
  },
  {
    nombre: 'Nature Made Multi For Her',
    categoria: 'Vitaminas',
    precio: 120000,
    descripcion:
      'Multivitamínico para mujer con 23 nutrientes clave, incluyendo hierro y calcio. Apoya el sistema inmunológico, la salud ósea y la energía celular.',
    imagen: '/assets/images/Multi-For-Her-NatureMade.JPEG',
  },
  {
    nombre: 'Maybelline The Colossal Mascara',
    categoria: 'Beauty',
    precio: 30000,
    descripcion:
      'Pestañina de volumen extremo que resalta la mirada sin dejar grumos. Ofrece una larga duración de hasta 24 horas.',
    imagen: '/assets/images/Pestañina-Maybelline.jpeg',
  },
  {
    nombre: 'Milani Baked Blush',
    categoria: 'Beauty',
    precio: 50000,
    descripcion:
      'Rubor horneado de textura sedosa que aporta un color radiante a las mejillas. Proporciona un acabado luminoso y de aspecto natural.',
    imagen: '/assets/images/PolvoMilani.jpeg',
  },
  {
    nombre: 'OLLY Probiotic + Prebiotic Gummies',
    categoria: 'Vitaminas',
    precio: 60000,
    descripcion:
      'Gomitas masticables con cultivos vivos y fibra prebiótica. Favorecen la salud digestiva, el equilibrio intestinal y el sistema inmunológico.',
    imagen: '/assets/images/Probioticos.jpg',
  },
  {
    nombre: 'Mario Badescu Facial Spray Set',
    categoria: 'Beauty',
    precio: 80000,
    descripcion:
      'Dúo de sprays faciales hidratantes formulados con aloe vera y extractos botánicos. Refrescan, calman y devuelven la luminosidad natural a la piel.',
    imagen: '/assets/images/SprayMarioBadescu.jpeg',
  },
  {
    nombre: 'OLLY Goodbye Stress Gummies',
    categoria: 'Vitaminas',
    precio: 50000,
    descripcion:
      'Gomitas masticables con GABA, L-teanina y bálsamo de limón. Ayudan a calmar la mente y a manejar el estrés diario manteniéndote enfocado.',
    imagen: '/assets/images/Stress-Gummies.jpg',
  },
  {
    nombre: 'Stanley Quencher H2.0 FlowState Tumbler',
    categoria: 'Fashion',
    precio: 150000,
    descripcion:
      'Termo de acero inoxidable con asa, pajita reutilizable y acabado brillante holográfico. Mantiene las bebidas frías durante horas con su aislamiento al vacío.',
    imagen: '/assets/images/TermoStanley.JPEG',
  },
  {
    nombre: 'Glow Recipe Watermelon Glow Duo (Toner + Dew Drops)',
    categoria: 'Beauty',
    precio: 140000,
    descripcion:
      'Dúo mini de cuidado facial con tónico exfoliante PHA + BHA y sérum de niacinamida. Minimiza poros, hidrata profundamente y aporta un brillo radiante.',
    imagen: '/assets/images/Tonico-Serum.JPEG',
  },
  {
    nombre: 'Nature Made Vitamin B12 1000 mcg',
    categoria: 'Vitaminas',
    precio: 120000,
    descripcion:
      'Suplemento de vitamina B12 en cápsulas blandas. Apoya la función de las células cerebrales y ayuda a reducir la fatiga en personas con deficiencia.',
    imagen: '/assets/images/VitaminaB12-NatureMade.JPEG',
  },
];

async function main() {
  console.log('Iniciando seed de ASM Market...');

  // Crear usuarios de prueba (admin y user) con contraseñas encriptadas
  const adminPassword = await bcrypt.hash('Admin123*', 10);
  const userPassword = await bcrypt.hash('Cliente123*', 10);

  const admin = await prisma.users.upsert({
    where: { email: 'admin@asmmarket.com' },
    update: {},
    create: {
      nombre: 'Administrador ASM',
      email: 'admin@asmmarket.com',
      password: adminPassword,
      role: 'admin',
      status: 'ACTIVE',
    },
  });

  const cliente = await prisma.users.upsert({
    where: { email: 'cliente@asmmarket.com' },
    update: {},
    create: {
      nombre: 'Cliente Prueba',
      email: 'cliente@asmmarket.com',
      password: userPassword,
      role: 'user',
      status: 'ACTIVE',
    },
  });

  console.log(`Usuarios listos: ${admin.email} (admin) y ${cliente.email} (user)`);

  // 2. Poblar el catálogo de productos si está vacío
  const countProductos = await prisma.productos.count();
  if (countProductos === 0) {
    await prisma.productos.createMany({
      data: productosIniciales,
    });
    console.log(`18 productos reales de ASM Market insertados.`);
  } else {
    console.log(`El catálogo ya tiene ${countProductos} productos.`);
  }

  // Crear un encargo de prueba si no hay ninguno
  const primerProducto = await prisma.productos.findFirst();
  const countEncargos = await prisma.encargos.count();

  if (primerProducto && countEncargos === 0) {
    await prisma.encargos.create({
      data: {
        user_id: cliente.id,
        producto_id: primerProducto.id,
        cantidad: 2,
        mensaje: 'Hola, quisiera encargar 2 unidades de este producto para envío a Medellín.',
        estado: 'PENDIENTE',
      },
    });
    console.log('Encargo de prueba creado exitosamente.');
  }

  console.log('Seed completado con éxito.');
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });