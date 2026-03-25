import { PrismaClient } from "@prisma/client";

// Inicializa o Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando o processo de seeding...");

  // --- Limpeza do Banco de Dados ---
  console.log("Limpando dados antigos...");
  // A ordem é importante para evitar erros de chave estrangeira
  await prisma.alimento_doacao.deleteMany({});
  await prisma.alimento_campanha.deleteMany({});
  await prisma.campanha.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.alimento.deleteMany({});
  console.log("Banco de dados limpo.");

  // --- 1. Inserir Alimentos ---
  const alimentosData = [
    // Categoria 1: Grãos e Cereais
    {
      nm_alimento: "Arroz (Tipo 1)",
      sg_medida_alimento: "kg",
      nm_tipo_alimento: "Grãos e Cereais",
      cd_tipo_alimento: 1,
    },
    {
      nm_alimento: "Feijão (Carioca)",
      sg_medida_alimento: "kg",
      nm_tipo_alimento: "Grãos e Cereais",
      cd_tipo_alimento: 1,
    },
    {
      nm_alimento: "Feijão (Preto)",
      sg_medida_alimento: "kg",
      nm_tipo_alimento: "Grãos e Cereais",
      cd_tipo_alimento: 1,
    },
    {
      nm_alimento: "Lentilha",
      sg_medida_alimento: "g", // Pacotes de 500g
      nm_tipo_alimento: "Grãos e Cereais",
      cd_tipo_alimento: 1,
    },
    {
      nm_alimento: "Grão-de-bico",
      sg_medida_alimento: "g", // Pacotes de 500g
      nm_tipo_alimento: "Grãos e Cereais",
      cd_tipo_alimento: 1,
    },

    // Categoria 2: Massas e Farináceos
    {
      nm_alimento: "Macarrão (Espaguete)",
      sg_medida_alimento: "g", // Pacotes de 500g
      nm_tipo_alimento: "Massas e Farináceos",
      cd_tipo_alimento: 2,
    },
    {
      nm_alimento: "Macarrão (Pena/Parafuso)",
      sg_medida_alimento: "g", // Pacotes de 500g
      nm_tipo_alimento: "Massas e Farináceos",
      cd_tipo_alimento: 2,
    },
    {
      nm_alimento: "Farinha de Trigo",
      sg_medida_alimento: "kg",
      nm_tipo_alimento: "Massas e Farináceos",
      cd_tipo_alimento: 2,
    },
    {
      nm_alimento: "Fubá (Mimoso)",
      sg_medida_alimento: "kg",
      nm_tipo_alimento: "Massas e Farináceos",
      cd_tipo_alimento: 2,
    },
    {
      nm_alimento: "Farinha de Mandioca",
      sg_medida_alimento: "kg",
      nm_tipo_alimento: "Massas e Farináceos",
      cd_tipo_alimento: 2,
    },
    {
      nm_alimento: "Cuscuz / Flocão de Milho",
      sg_medida_alimento: "g", // Pacotes de 500g
      nm_tipo_alimento: "Massas e Farináceos",
      cd_tipo_alimento: 2,
    },

    // Categoria 3: Proteínas (Conservas)
    // Removi "Carne Bovina" e "Ovos" por serem perecíveis
    {
      nm_alimento: "Carne Seca (Charque)",
      sg_medida_alimento: "g", // Pacotes de 500g
      nm_tipo_alimento: "Proteínas (Conservas)",
      cd_tipo_alimento: 3,
    },
    {
      nm_alimento: "Sardinha (Lata)",
      sg_medida_alimento: "un",
      nm_tipo_alimento: "Proteínas (Conservas)",
      cd_tipo_alimento: 3,
    },
    {
      nm_alimento: "Atum (Lata)",
      sg_medida_alimento: "un",
      nm_tipo_alimento: "Proteínas (Conservas)",
      cd_tipo_alimento: 3,
    },

    // Categoria 4: Óleos e Temperos
    {
      nm_alimento: "Óleo de Soja",
      sg_medida_alimento: "l",
      nm_tipo_alimento: "Óleos e Temperos",
      cd_tipo_alimento: 4,
    },
    {
      nm_alimento: "Azeite",
      sg_medida_alimento: "l", // Garrafas de 500ml (0.5l) ou 1l
      nm_tipo_alimento: "Óleos e Temperos",
      cd_tipo_alimento: 4,
    },
    {
      nm_alimento: "Sal Refinado",
      sg_medida_alimento: "kg",
      nm_tipo_alimento: "Óleos e Temperos",
      cd_tipo_alimento: 4,
    },
    {
      nm_alimento: "Vinagre",
      sg_medida_alimento: "l",
      nm_tipo_alimento: "Óleos e Temperos",
      cd_tipo_alimento: 4,
    },

    // Categoria 5: Mercearia / Matinais
    {
      nm_alimento: "Café (Pó)",
      sg_medida_alimento: "g", // Pacotes de 500g
      nm_tipo_alimento: "Mercearia / Matinais",
      cd_tipo_alimento: 5,
    },
    {
      nm_alimento: "Açúcar (Refinado)",
      sg_medida_alimento: "kg",
      nm_tipo_alimento: "Mercearia / Matinais",
      cd_tipo_alimento: 5,
    },
    {
      nm_alimento: "Leite em Pó",
      sg_medida_alimento: "g", // Latas de 400g
      nm_tipo_alimento: "Mercearia / Matinais",
      cd_tipo_alimento: 5,
    },
    {
      nm_alimento: "Achocolatado em Pó",
      sg_medida_alimento: "g", // Latas de 400g
      nm_tipo_alimento: "Mercearia / Matinais",
      cd_tipo_alimento: 5,
    },

    // Categoria 6: Enlatados e Conservas
    {
      nm_alimento: "Molho de Tomate (Sachê/Lata)",
      sg_medida_alimento: "un",
      nm_tipo_alimento: "Enlatados e Conservas",
      cd_tipo_alimento: 6,
    },
    {
      nm_alimento: "Milho (Lata)",
      sg_medida_alimento: "un",
      nm_tipo_alimento: "Enlatados e Conservas",
      cd_tipo_alimento: 6,
    },
    {
      nm_alimento: "Ervilha (Lata)",
      sg_medida_alimento: "un",
      nm_tipo_alimento: "Enlatados e Conservas",
      cd_tipo_alimento: 6,
    },
    {
      nm_alimento: "Seleta de Legumes (Lata)",
      sg_medida_alimento: "un",
      nm_tipo_alimento: "Enlatados e Conservas",
      cd_tipo_alimento: 6,
    },

    // Categoria 7: Biscoitos e Doces
    {
      nm_alimento: "Biscoito (Água e Sal)",
      sg_medida_alimento: "pct",
      nm_tipo_alimento: "Biscoitos e Doces",
      cd_tipo_alimento: 7,
    },
    {
      nm_alimento: "Biscoito (Maisena)",
      sg_medida_alimento: "pct",
      nm_tipo_alimento: "Biscoitos e Doces",
      cd_tipo_alimento: 7,
    },
    {
      nm_alimento: "Goiabada",
      sg_medida_alimento: "g", // Embalagens de 300g ou 500g
      nm_tipo_alimento: "Biscoitos e Doces",
      cd_tipo_alimento: 7,
    },
  ];
  await prisma.alimento.createMany({ data: alimentosData });
  console.log(`${alimentosData.length} alimentos inseridos com sucesso!`);

  // --- 2. Inserir Usuários ---
  const usuariosData = [
    {
      nm_usuario: "Yago Silva",
      tipo_usuario: "pf",
      ch_cpf_usuario: "12345678901",
      dt_nascimento_usuario: new Date("1990-05-15T00:00:00Z"),
      nr_celular_usuario: "11987654321",
      sg_estado_usuario: "SP",
      nm_cidade_usuario: "São Paulo",
      cd_foto_usuario: "1.png",
      cd_senha_usuario:
        "$2a$12$qYnfcan1eAudlxLP0mfxVeNk8Qnu8PHwhirai94t1F8ppGtG3eNw2",
      cd_email_usuario: "yago@email.com",
    },
    {
      nm_usuario: "Maria Santos",
      tipo_usuario: "pf",
      ch_cpf_usuario: "98765432109",
      dt_nascimento_usuario: new Date("1985-12-10T00:00:00Z"),
      nr_celular_usuario: "11901234567",
      sg_estado_usuario: "RJ",
      nm_cidade_usuario: "Rio de Janeiro",
      cd_foto_usuario: "2.png",
      cd_senha_usuario:
        "$2a$12$qYnfcan1eAudlxLP0mfxVeNk8Qnu8PHwhirai94t1F8ppGtG3eNw2",
      cd_email_usuario: "maria@example.com",
    },
    {
      nm_usuario: "Pedro Oliveira",
      tipo_usuario: "pf",
      ch_cpf_usuario: "45678901234",
      dt_nascimento_usuario: new Date("1978-08-20T00:00:00Z"),
      nr_celular_usuario: "11955556666",
      sg_estado_usuario: "MG",
      nm_cidade_usuario: "Belo Horizonte",
      cd_foto_usuario: "3.png",
      cd_senha_usuario:
        "$2a$12$qYnfcan1eAudlxLP0mfxVeNk8Qnu8PHwhirai94t1F8ppGtG3eNw2",
      cd_email_usuario: "pedro@example.com",
    },
    {
      nm_usuario: "Empresa ABC Ltda",
      tipo_usuario: "pj",
      ch_cnpj_usuario: "12345678901234",
      nr_celular_usuario: "11999998888",
      sg_estado_usuario: "SP",
      nm_cidade_usuario: "São Paulo",
      cd_foto_usuario: "4.png",
      cd_senha_usuario:
        "$2a$12$qYnfcan1eAudlxLP0mfxVeNk8Qnu8PHwhirai94t1F8ppGtG3eNw2",
      cd_email_usuario: "empresa@example.com",
    },
    {
      nm_usuario: "Comércio XYZ Ltda",
      tipo_usuario: "pj",
      ch_cnpj_usuario: "98765432109876",
      nr_celular_usuario: "11888887777",
      sg_estado_usuario: "RJ",
      nm_cidade_usuario: "Rio de Janeiro",
      cd_foto_usuario: "default.png",
      cd_senha_usuario:
        "$2a$12$qYnfcan1eAudlxLP0mfxVeNk8Qnu8PHwhirai94t1F8ppGtG3eNw2",
      cd_email_usuario: "comercio@example.com",
    },
  ];
  await prisma.usuario.createMany({ data: usuariosData });
  console.log(`${usuariosData.length} usuários inseridos com sucesso!`);

  // --- Busca os IDs dos registros criados ---
  const todosAlimentos = await prisma.alimento.findMany({
    orderBy: { nm_alimento: "asc" },
  });
  const todosUsuarios = await prisma.usuario.findMany({
    orderBy: { nm_usuario: "asc" },
  });

  // --- 3. Inserir Campanhas ---
  const campanhasData = [
    {
      usuario_id: todosUsuarios[4].id, // Yago Silva
      nm_titulo_campanha: "Campanha da Solidariedade",
      dt_encerramento_campanha: new Date("2027-10-10T00:00:00Z"),
      nm_cidade_campanha: "São Paulo",
      sg_estado_campanha: "SP",
      ds_acao_campanha:
        "Esta campanha visa arrecadar alimentos para famílias em situação de vulnerabilidade social.",
      cd_imagem_campanha: "1.png",
      fg_campanha_ativa: true,
    },
    {
      usuario_id: todosUsuarios[2].id, // Maria Santos
      nm_titulo_campanha: "Ajude a Alimentar Famílias",
      dt_encerramento_campanha: new Date("2026-08-15T00:00:00Z"),
      nm_cidade_campanha: "Rio de Janeiro",
      sg_estado_campanha: "RJ",
      ds_acao_campanha: "Nossa missão é garantir que ninguém passe fome.",
      cd_imagem_campanha: "2.png",
      fg_campanha_ativa: true,
    },
  ];
  await prisma.campanha.createMany({ data: campanhasData });
  console.log(`${campanhasData.length} campanhas inseridas com sucesso!`);

  // --- Busca os IDs das campanhas criadas ---
  const todasCampanhas = await prisma.campanha.findMany();

  // --- 4. Relacionar Alimentos às Campanhas ---
  const alimentosCampanhaData = [
    {
      campanha_id: todasCampanhas[0].id,
      alimento_id: todosAlimentos[0].id,
      qt_alimento_meta: 100,
    }, // Arroz
    {
      campanha_id: todasCampanhas[0].id,
      alimento_id: todosAlimentos[4].id,
      qt_alimento_meta: 50,
    }, // Feijão
    {
      campanha_id: todasCampanhas[1].id,
      alimento_id: todosAlimentos[7].id,
      qt_alimento_meta: 200,
    }, // Macarrão
    {
      campanha_id: todasCampanhas[1].id,
      alimento_id: todosAlimentos[2].id,
      qt_alimento_meta: 150,
    }, // Café
  ];
  await prisma.alimento_campanha.createMany({ data: alimentosCampanhaData });
  console.log(
    `${alimentosCampanhaData.length} relações alimento-campanha inseridas com sucesso!`
  );

  // --- 5. Inserir Doações ---
  const doacoesData = [
    {
      usuario_id: todosUsuarios[1].id, // Empresa ABC
      alimento_id: todosAlimentos[0].id, // Arroz
      campanha_id: todasCampanhas[0].id,
      qt_alimento_doado: 50,
    },
    {
      usuario_id: todosUsuarios[0].id, // Comercio XYZ
      alimento_id: todosAlimentos[4].id, // Feijão
      campanha_id: todasCampanhas[0].id,
      qt_alimento_doado: 25,
    },
    {
      usuario_id: todosUsuarios[3].id, // Pedro Oliveira
      alimento_id: todosAlimentos[2].id, // Café
      campanha_id: todasCampanhas[1].id,
      qt_alimento_doado: 10,
    },
  ];
  await prisma.alimento_doacao.createMany({ data: doacoesData });
  console.log(`${doacoesData.length} doações inseridas com sucesso!`);
}

// --- Execução do Script ---
main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seeding finalizado com sucesso!");
  })
  .catch(async (e) => {
    console.error("Ocorreu um erro durante o seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
