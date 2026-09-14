# Climaps

Aplicativo mobile de clima e previsão do tempo para Android e iOS. O Climaps usa a localização atual ou um ponto escolhido no mapa para consultar condições meteorológicas, previsão diária, horários de nascer e pôr do sol e identificação aproximada do local.

## Funcionalidades

- clima atual, sensação térmica, umidade e vento;
- previsão diária com temperaturas máxima e mínima;
- nascer e pôr do sol no fuso horário da localização;
- seleção de coordenadas em mapa interativo;
- geocodificação reversa para cidade, estado e país;
- temas claro, escuro e automático;
- cache e atualização de dados com TanStack Query;
- navegação nativa por abas com Expo Router.

## Stack

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) e React Native 0.86;
- React 19, TypeScript 6 e Expo Router;
- TanStack Query para estado assíncrono e cache;
- Axios para requisições HTTP;
- React Hook Form e Zod para formulários e validação;
- Leaflet, OpenStreetMap e CARTO para mapas;
- Open-Meteo para dados meteorológicos;
- BigDataCloud para geocodificação reversa;
- Readex Pro como família tipográfica sans-serif;
- EAS Build para builds distribuíveis.

## Pré-requisitos

- Node.js compatível com o Expo SDK 57;
- [pnpm](https://pnpm.io/) 12.3.3;
- Expo Go, Android Studio ou Xcode para execução nativa;
- conta Expo para builds com EAS.

Com Corepack:

```bash
corepack enable
corepack prepare pnpm@12.3.3 --activate
```

## Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/josee-fernandes/climaps.git
cd climaps
pnpm install
```

Crie o arquivo de ambiente local:

```bash
cp .env.example .env.local
```

Preencha `EXPO_PUBLIC_CARTO_API_KEY` se quiser usar uma chave própria dos mapas CARTO. Variáveis com prefixo `EXPO_PUBLIC_` são incorporadas ao bundle e não devem conter segredos.

## Desenvolvimento

Inicie o Metro:

```bash
pnpm start
```

Comandos disponíveis:

```bash
pnpm android       # Metro e abertura no Android
pnpm ios           # Metro e abertura no iOS (macOS)
pnpm start:tunnel  # Metro por túnel para dispositivo físico
```

Depois de alterar plugins, ícones, splash screen ou outra configuração nativa de `app.json`, gere e instale um novo build. O Expo Go não reproduz integralmente o splash nativo.

## Qualidade e validação

```bash
pnpm typecheck   # checagem de tipos com TypeScript
pnpm lint        # ESLint via Expo CLI (instala a config na primeira execução)
```

## Builds com EAS

O projeto possui os perfis `development`, `preview` e `production` em `eas.json`. É possível usar o EAS CLI sem instalação global:

```bash
pnpm dlx eas-cli@latest login
pnpm dlx eas-cli@latest whoami
```

Cadastre a variável usada pelos mapas em cada ambiente necessário:

```bash
pnpm dlx eas-cli@latest env:create \
  --environment preview \
  --name EXPO_PUBLIC_CARTO_API_KEY \
  --value SUA_CHAVE \
  --visibility sensitive
```

Build Android instalável em dispositivo ou emulador (`.apk`):

```bash
pnpm dlx eas-cli@latest build --platform android --profile preview
```

Builds de produção para as lojas:

```bash
pnpm dlx eas-cli@latest build --platform android --profile production
pnpm dlx eas-cli@latest build --platform ios --profile production
```

O Android de produção gera um AAB para a Google Play. Builds iOS para distribuição exigem uma conta ativa no Apple Developer Program.

Para enviar o último build:

```bash
pnpm dlx eas-cli@latest submit --platform android --profile production
pnpm dlx eas-cli@latest submit --platform ios --profile production
```

## Estrutura principal

```text
src/
├── app/          # rotas e layouts do Expo Router
├── components/   # componentes visuais e de domínio
├── constants/    # configuração, tema e tokens
├── contexts/     # estado global por contexto
├── hooks/        # localização, clima, mapa e tema
├── services/     # clientes e integrações HTTP
├── storage/      # persistência local
├── utils/        # formatação e regras auxiliares
└── @types/       # contratos das APIs e do domínio
assets/
├── fonts/        # arquivos locais da Readex Pro
└── images/       # ícone e logo usados nos builds
```

## Serviços externos e atribuições

- Dados meteorológicos: [Open-Meteo](https://open-meteo.com/).
- Dados cartográficos: [OpenStreetMap](https://www.openstreetmap.org/copyright).
- Tiles de mapa: [CARTO](https://carto.com/attributions).
- Geocodificação reversa: [BigDataCloud](https://www.bigdatacloud.com/).

O aplicativo solicita localização aproximada e precisa para consultar o clima da região escolhida. Consulte `app.json` para a descrição da permissão exibida pelo sistema.

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](./LICENSE).

Copyright © 2026 [José Vitor dos Santos Fernandes](https://github.com/josee-fernandes).
