import { PrismaClient, Phase } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding times...');

  // Limpa na ordem correta por FK
  await prisma.prediction.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();

  const teams = await prisma.team.createManyAndReturn({
    data: [
      // Grupo A
      { name: 'México',          flag: 'mx',     groupLetter: 'A' },
      { name: 'África do Sul',   flag: 'za',     groupLetter: 'A' },
      { name: 'Coreia do Sul',   flag: 'kr',     groupLetter: 'A' },
      { name: 'Tchéquia',        flag: 'cz',     groupLetter: 'A' },
      // Grupo B
      { name: 'Canadá',          flag: 'ca',     groupLetter: 'B' },
      { name: 'Bósnia',          flag: 'ba',     groupLetter: 'B' },
      { name: 'Suíça',           flag: 'ch',     groupLetter: 'B' },
      { name: 'Catar',           flag: 'qa',     groupLetter: 'B' },
      // Grupo C
      { name: 'Brasil',          flag: 'br',     groupLetter: 'C' },
      { name: 'Marrocos',        flag: 'ma',     groupLetter: 'C' },
      { name: 'Haiti',           flag: 'ht',     groupLetter: 'C' },
      { name: 'Escócia',         flag: 'gb-sct', groupLetter: 'C' },
      // Grupo D
      { name: 'EUA',             flag: 'us',     groupLetter: 'D' },
      { name: 'Paraguai',        flag: 'py',     groupLetter: 'D' },
      { name: 'Austrália',       flag: 'au',     groupLetter: 'D' },
      { name: 'Turquia',         flag: 'tr',     groupLetter: 'D' },
      // Grupo E
      { name: 'Alemanha',        flag: 'de',     groupLetter: 'E' },
      { name: 'Curaçao',         flag: 'cw',     groupLetter: 'E' },
      { name: 'Costa do Marfim', flag: 'ci',     groupLetter: 'E' },
      { name: 'Equador',         flag: 'ec',     groupLetter: 'E' },
      // Grupo F
      { name: 'Holanda',         flag: 'nl',     groupLetter: 'F' },
      { name: 'Japão',           flag: 'jp',     groupLetter: 'F' },
      { name: 'Suécia',          flag: 'se',     groupLetter: 'F' },
      { name: 'Tunísia',         flag: 'tn',     groupLetter: 'F' },
      // Grupo G
      { name: 'Bélgica',         flag: 'be',     groupLetter: 'G' },
      { name: 'Egito',           flag: 'eg',     groupLetter: 'G' },
      { name: 'Irã',             flag: 'ir',     groupLetter: 'G' },
      { name: 'Nova Zelândia',   flag: 'nz',     groupLetter: 'G' },
      // Grupo H
      { name: 'Espanha',         flag: 'es',     groupLetter: 'H' },
      { name: 'Cabo Verde',      flag: 'cv',     groupLetter: 'H' },
      { name: 'Arábia Saudita',  flag: 'sa',     groupLetter: 'H' },
      { name: 'Uruguai',         flag: 'uy',     groupLetter: 'H' },
      // Grupo I
      { name: 'França',          flag: 'fr',     groupLetter: 'I' },
      { name: 'Senegal',         flag: 'sn',     groupLetter: 'I' },
      { name: 'Iraque',          flag: 'iq',     groupLetter: 'I' },
      { name: 'Noruega',         flag: 'no',     groupLetter: 'I' },
      // Grupo J
      { name: 'Argentina',       flag: 'ar',     groupLetter: 'J' },
      { name: 'Argélia',         flag: 'dz',     groupLetter: 'J' },
      { name: 'Áustria',         flag: 'at',     groupLetter: 'J' },
      { name: 'Jordânia',        flag: 'jo',     groupLetter: 'J' },
      // Grupo K
      { name: 'Portugal',        flag: 'pt',     groupLetter: 'K' },
      { name: 'RD Congo',        flag: 'cd',     groupLetter: 'K' },
      { name: 'Uzbequistão',     flag: 'uz',     groupLetter: 'K' },
      { name: 'Colômbia',        flag: 'co',     groupLetter: 'K' },
      // Grupo L
      { name: 'Inglaterra',      flag: 'gb-eng', groupLetter: 'L' },
      { name: 'Croácia',         flag: 'hr',     groupLetter: 'L' },
      { name: 'Gana',            flag: 'gh',     groupLetter: 'L' },
      { name: 'Panamá',          flag: 'pa',     groupLetter: 'L' },
    ],
  });

  // Mapeia nome → id gerado pelo banco
  const t = Object.fromEntries(teams.map((team) => [team.name, team.id])) as Record<string, number>;

  console.log('Seeding jogos da fase de grupos...');

  type MatchInput = {
    matchDate: Date;
    phase: Phase;
    groupLetter?: string;
    homeTeamId?: number;
    awayTeamId?: number;
    homeScore?: number;
    awayScore?: number;
  };

  const d = (iso: string) => new Date(iso);

  // Resultados confirmados até 14/06/2026.
  // Datas futuras são ESTIMADAS — corrija via PUT /api/admin/matches/:id
  const groupMatches: MatchInput[] = [
    // ===== RODADA 1 =====
    // Grupo A — CONFIRMADOS
    { matchDate: d('2026-06-11T19:00:00Z'), phase: 'group', groupLetter: 'A', homeTeamId: t['México'],        awayTeamId: t['África do Sul'],  homeScore: 2, awayScore: 0 },
    { matchDate: d('2026-06-11T22:00:00Z'), phase: 'group', groupLetter: 'A', homeTeamId: t['Coreia do Sul'], awayTeamId: t['Tchéquia'],       homeScore: 2, awayScore: 1 },
    // Grupo D — CONFIRMADO
    { matchDate: d('2026-06-12T19:00:00Z'), phase: 'group', groupLetter: 'D', homeTeamId: t['EUA'],           awayTeamId: t['Paraguai'],       homeScore: 4, awayScore: 1 },
    // Grupo B — CONFIRMADOS
    { matchDate: d('2026-06-12T22:00:00Z'), phase: 'group', groupLetter: 'B', homeTeamId: t['Canadá'],        awayTeamId: t['Bósnia'],         homeScore: 1, awayScore: 1 },
    { matchDate: d('2026-06-13T16:00:00Z'), phase: 'group', groupLetter: 'B', homeTeamId: t['Suíça'],         awayTeamId: t['Catar'],          homeScore: 1, awayScore: 1 },
    // Grupo C — CONFIRMADOS
    { matchDate: d('2026-06-13T22:00:00Z'), phase: 'group', groupLetter: 'C', homeTeamId: t['Brasil'],        awayTeamId: t['Marrocos'],       homeScore: 1, awayScore: 1 },
    { matchDate: d('2026-06-14T01:00:00Z'), phase: 'group', groupLetter: 'D', homeTeamId: t['Austrália'],     awayTeamId: t['Turquia'],        homeScore: 2, awayScore: 0 },
    { matchDate: d('2026-06-14T16:00:00Z'), phase: 'group', groupLetter: 'C', homeTeamId: t['Haiti'],         awayTeamId: t['Escócia'],        homeScore: 0, awayScore: 1 },
    // Grupo E — CONFIRMADOS
    { matchDate: d('2026-06-14T19:00:00Z'), phase: 'group', groupLetter: 'E', homeTeamId: t['Alemanha'],      awayTeamId: t['Curaçao'],        homeScore: 7, awayScore: 1 },
    { matchDate: d('2026-06-14T22:00:00Z'), phase: 'group', groupLetter: 'E', homeTeamId: t['Costa do Marfim'], awayTeamId: t['Equador'],      homeScore: 1, awayScore: 0 },
    // Grupo G (15/jun)
    { matchDate: d('2026-06-15T16:00:00Z'), phase: 'group', groupLetter: 'G', homeTeamId: t['Bélgica'],       awayTeamId: t['Egito'] },
    { matchDate: d('2026-06-15T22:00:00Z'), phase: 'group', groupLetter: 'G', homeTeamId: t['Irã'],           awayTeamId: t['Nova Zelândia'] },
    // Grupo H (15/jun)
    { matchDate: d('2026-06-15T19:00:00Z'), phase: 'group', groupLetter: 'H', homeTeamId: t['Espanha'],       awayTeamId: t['Cabo Verde'] },
    { matchDate: d('2026-06-16T01:00:00Z'), phase: 'group', groupLetter: 'H', homeTeamId: t['Arábia Saudita'], awayTeamId: t['Uruguai'] },
    // Grupo F (16/jun — estimado)
    { matchDate: d('2026-06-16T16:00:00Z'), phase: 'group', groupLetter: 'F', homeTeamId: t['Holanda'],       awayTeamId: t['Japão'] },
    { matchDate: d('2026-06-16T22:00:00Z'), phase: 'group', groupLetter: 'F', homeTeamId: t['Suécia'],        awayTeamId: t['Tunísia'] },
    // Grupo I (16-17/jun — estimado)
    { matchDate: d('2026-06-16T19:00:00Z'), phase: 'group', groupLetter: 'I', homeTeamId: t['França'],        awayTeamId: t['Senegal'] },
    { matchDate: d('2026-06-17T01:00:00Z'), phase: 'group', groupLetter: 'I', homeTeamId: t['Iraque'],        awayTeamId: t['Noruega'] },
    // Grupo J (17/jun — estimado)
    { matchDate: d('2026-06-17T16:00:00Z'), phase: 'group', groupLetter: 'J', homeTeamId: t['Argentina'],     awayTeamId: t['Argélia'] },
    { matchDate: d('2026-06-17T19:00:00Z'), phase: 'group', groupLetter: 'J', homeTeamId: t['Áustria'],       awayTeamId: t['Jordânia'] },
    // Grupo K (17-18/jun — estimado)
    { matchDate: d('2026-06-17T22:00:00Z'), phase: 'group', groupLetter: 'K', homeTeamId: t['Portugal'],      awayTeamId: t['RD Congo'] },
    { matchDate: d('2026-06-18T01:00:00Z'), phase: 'group', groupLetter: 'K', homeTeamId: t['Uzbequistão'],   awayTeamId: t['Colômbia'] },
    // Grupo L (18/jun — estimado)
    { matchDate: d('2026-06-18T16:00:00Z'), phase: 'group', groupLetter: 'L', homeTeamId: t['Inglaterra'],    awayTeamId: t['Croácia'] },
    { matchDate: d('2026-06-18T19:00:00Z'), phase: 'group', groupLetter: 'L', homeTeamId: t['Gana'],          awayTeamId: t['Panamá'] },

    // ===== RODADA 2 =====
    { matchDate: d('2026-06-20T19:00:00Z'), phase: 'group', groupLetter: 'A', homeTeamId: t['México'],        awayTeamId: t['Coreia do Sul'] },
    { matchDate: d('2026-06-20T22:00:00Z'), phase: 'group', groupLetter: 'A', homeTeamId: t['África do Sul'], awayTeamId: t['Tchéquia'] },
    { matchDate: d('2026-06-21T16:00:00Z'), phase: 'group', groupLetter: 'B', homeTeamId: t['Canadá'],        awayTeamId: t['Suíça'] },
    { matchDate: d('2026-06-21T19:00:00Z'), phase: 'group', groupLetter: 'B', homeTeamId: t['Bósnia'],        awayTeamId: t['Catar'] },
    { matchDate: d('2026-06-21T22:00:00Z'), phase: 'group', groupLetter: 'C', homeTeamId: t['Brasil'],        awayTeamId: t['Haiti'] },
    { matchDate: d('2026-06-22T01:00:00Z'), phase: 'group', groupLetter: 'C', homeTeamId: t['Marrocos'],      awayTeamId: t['Escócia'] },
    { matchDate: d('2026-06-22T16:00:00Z'), phase: 'group', groupLetter: 'D', homeTeamId: t['EUA'],           awayTeamId: t['Austrália'] },
    { matchDate: d('2026-06-22T19:00:00Z'), phase: 'group', groupLetter: 'D', homeTeamId: t['Paraguai'],      awayTeamId: t['Turquia'] },
    { matchDate: d('2026-06-22T22:00:00Z'), phase: 'group', groupLetter: 'E', homeTeamId: t['Alemanha'],      awayTeamId: t['Costa do Marfim'] },
    { matchDate: d('2026-06-23T01:00:00Z'), phase: 'group', groupLetter: 'E', homeTeamId: t['Curaçao'],       awayTeamId: t['Equador'] },
    { matchDate: d('2026-06-23T16:00:00Z'), phase: 'group', groupLetter: 'F', homeTeamId: t['Holanda'],       awayTeamId: t['Suécia'] },
    { matchDate: d('2026-06-23T19:00:00Z'), phase: 'group', groupLetter: 'F', homeTeamId: t['Japão'],         awayTeamId: t['Tunísia'] },
    { matchDate: d('2026-06-23T22:00:00Z'), phase: 'group', groupLetter: 'G', homeTeamId: t['Bélgica'],       awayTeamId: t['Irã'] },
    { matchDate: d('2026-06-24T01:00:00Z'), phase: 'group', groupLetter: 'G', homeTeamId: t['Egito'],         awayTeamId: t['Nova Zelândia'] },
    { matchDate: d('2026-06-24T16:00:00Z'), phase: 'group', groupLetter: 'H', homeTeamId: t['Espanha'],       awayTeamId: t['Arábia Saudita'] },
    { matchDate: d('2026-06-24T19:00:00Z'), phase: 'group', groupLetter: 'H', homeTeamId: t['Cabo Verde'],    awayTeamId: t['Uruguai'] },
    { matchDate: d('2026-06-24T22:00:00Z'), phase: 'group', groupLetter: 'I', homeTeamId: t['França'],        awayTeamId: t['Iraque'] },
    { matchDate: d('2026-06-25T01:00:00Z'), phase: 'group', groupLetter: 'I', homeTeamId: t['Senegal'],       awayTeamId: t['Noruega'] },
    { matchDate: d('2026-06-25T16:00:00Z'), phase: 'group', groupLetter: 'J', homeTeamId: t['Argentina'],     awayTeamId: t['Áustria'] },
    { matchDate: d('2026-06-25T19:00:00Z'), phase: 'group', groupLetter: 'J', homeTeamId: t['Argélia'],       awayTeamId: t['Jordânia'] },
    { matchDate: d('2026-06-25T22:00:00Z'), phase: 'group', groupLetter: 'K', homeTeamId: t['Portugal'],      awayTeamId: t['Uzbequistão'] },
    { matchDate: d('2026-06-26T01:00:00Z'), phase: 'group', groupLetter: 'K', homeTeamId: t['RD Congo'],      awayTeamId: t['Colômbia'] },
    { matchDate: d('2026-06-26T16:00:00Z'), phase: 'group', groupLetter: 'L', homeTeamId: t['Inglaterra'],    awayTeamId: t['Gana'] },
    { matchDate: d('2026-06-26T19:00:00Z'), phase: 'group', groupLetter: 'L', homeTeamId: t['Croácia'],       awayTeamId: t['Panamá'] },

    // ===== RODADA 3 (simultâneos por grupo) =====
    { matchDate: d('2026-06-26T22:00:00Z'), phase: 'group', groupLetter: 'A', homeTeamId: t['México'],        awayTeamId: t['Tchéquia'] },
    { matchDate: d('2026-06-26T22:00:00Z'), phase: 'group', groupLetter: 'A', homeTeamId: t['África do Sul'], awayTeamId: t['Coreia do Sul'] },
    { matchDate: d('2026-06-27T16:00:00Z'), phase: 'group', groupLetter: 'B', homeTeamId: t['Canadá'],        awayTeamId: t['Catar'] },
    { matchDate: d('2026-06-27T16:00:00Z'), phase: 'group', groupLetter: 'B', homeTeamId: t['Bósnia'],        awayTeamId: t['Suíça'] },
    { matchDate: d('2026-06-27T19:00:00Z'), phase: 'group', groupLetter: 'C', homeTeamId: t['Brasil'],        awayTeamId: t['Escócia'] },
    { matchDate: d('2026-06-27T19:00:00Z'), phase: 'group', groupLetter: 'C', homeTeamId: t['Marrocos'],      awayTeamId: t['Haiti'] },
    { matchDate: d('2026-06-27T19:00:00Z'), phase: 'group', groupLetter: 'D', homeTeamId: t['EUA'],           awayTeamId: t['Turquia'] },
    { matchDate: d('2026-06-27T19:00:00Z'), phase: 'group', groupLetter: 'D', homeTeamId: t['Paraguai'],      awayTeamId: t['Austrália'] },
    { matchDate: d('2026-06-27T22:00:00Z'), phase: 'group', groupLetter: 'E', homeTeamId: t['Alemanha'],      awayTeamId: t['Equador'] },
    { matchDate: d('2026-06-27T22:00:00Z'), phase: 'group', groupLetter: 'E', homeTeamId: t['Curaçao'],       awayTeamId: t['Costa do Marfim'] },
    { matchDate: d('2026-06-27T22:00:00Z'), phase: 'group', groupLetter: 'F', homeTeamId: t['Holanda'],       awayTeamId: t['Tunísia'] },
    { matchDate: d('2026-06-27T22:00:00Z'), phase: 'group', groupLetter: 'F', homeTeamId: t['Japão'],         awayTeamId: t['Suécia'] },
    { matchDate: d('2026-06-28T16:00:00Z'), phase: 'group', groupLetter: 'G', homeTeamId: t['Bélgica'],       awayTeamId: t['Nova Zelândia'] },
    { matchDate: d('2026-06-28T16:00:00Z'), phase: 'group', groupLetter: 'G', homeTeamId: t['Egito'],         awayTeamId: t['Irã'] },
    { matchDate: d('2026-06-28T19:00:00Z'), phase: 'group', groupLetter: 'H', homeTeamId: t['Espanha'],       awayTeamId: t['Uruguai'] },
    { matchDate: d('2026-06-28T19:00:00Z'), phase: 'group', groupLetter: 'H', homeTeamId: t['Cabo Verde'],    awayTeamId: t['Arábia Saudita'] },
    { matchDate: d('2026-06-28T22:00:00Z'), phase: 'group', groupLetter: 'I', homeTeamId: t['França'],        awayTeamId: t['Noruega'] },
    { matchDate: d('2026-06-28T22:00:00Z'), phase: 'group', groupLetter: 'I', homeTeamId: t['Senegal'],       awayTeamId: t['Iraque'] },
    { matchDate: d('2026-06-29T16:00:00Z'), phase: 'group', groupLetter: 'J', homeTeamId: t['Argentina'],     awayTeamId: t['Jordânia'] },
    { matchDate: d('2026-06-29T16:00:00Z'), phase: 'group', groupLetter: 'J', homeTeamId: t['Argélia'],       awayTeamId: t['Áustria'] },
    { matchDate: d('2026-06-29T19:00:00Z'), phase: 'group', groupLetter: 'K', homeTeamId: t['Portugal'],      awayTeamId: t['Colômbia'] },
    { matchDate: d('2026-06-29T19:00:00Z'), phase: 'group', groupLetter: 'K', homeTeamId: t['RD Congo'],      awayTeamId: t['Uzbequistão'] },
    { matchDate: d('2026-06-29T22:00:00Z'), phase: 'group', groupLetter: 'L', homeTeamId: t['Inglaterra'],    awayTeamId: t['Panamá'] },
    { matchDate: d('2026-06-29T22:00:00Z'), phase: 'group', groupLetter: 'L', homeTeamId: t['Croácia'],       awayTeamId: t['Gana'] },
  ];

  await prisma.match.createMany({ data: groupMatches });

  console.log('Seeding fase eliminatória...');

  // Oitavas (16 jogos), Quartas (8), Semi (4), Semi (2), 3º/Final
  const knockoutMatches: { matchDate: Date; phase: Phase }[] = [
    // Oitavas
    { matchDate: d('2026-06-30T19:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-06-30T22:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-01T01:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-01T19:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-01T22:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-02T01:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-02T19:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-02T22:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-03T01:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-03T19:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-03T22:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-04T01:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-04T19:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-04T22:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-05T01:00:00Z'), phase: 'round_of_32' },
    { matchDate: d('2026-07-05T19:00:00Z'), phase: 'round_of_32' },
    // Quartas
    { matchDate: d('2026-07-06T19:00:00Z'), phase: 'round_of_16' },
    { matchDate: d('2026-07-06T22:00:00Z'), phase: 'round_of_16' },
    { matchDate: d('2026-07-07T19:00:00Z'), phase: 'round_of_16' },
    { matchDate: d('2026-07-07T22:00:00Z'), phase: 'round_of_16' },
    { matchDate: d('2026-07-08T19:00:00Z'), phase: 'round_of_16' },
    { matchDate: d('2026-07-08T22:00:00Z'), phase: 'round_of_16' },
    { matchDate: d('2026-07-09T19:00:00Z'), phase: 'round_of_16' },
    { matchDate: d('2026-07-09T22:00:00Z'), phase: 'round_of_16' },
    // Semifinais
    { matchDate: d('2026-07-11T22:00:00Z'), phase: 'quarterfinal' },
    { matchDate: d('2026-07-12T01:00:00Z'), phase: 'quarterfinal' },
    { matchDate: d('2026-07-12T22:00:00Z'), phase: 'quarterfinal' },
    { matchDate: d('2026-07-13T01:00:00Z'), phase: 'quarterfinal' },
    // Finais
    { matchDate: d('2026-07-15T22:00:00Z'), phase: 'semifinal' },
    { matchDate: d('2026-07-16T22:00:00Z'), phase: 'semifinal' },
    { matchDate: d('2026-07-18T22:00:00Z'), phase: 'bronze' },
    { matchDate: d('2026-07-19T22:00:00Z'), phase: 'final' },
  ];

  await prisma.match.createMany({ data: knockoutMatches });

  console.log('Seed concluído!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
