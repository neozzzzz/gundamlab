# GundamLab Frontend 코드 리뷰 검증 (시니어 엔지니어 관점)

기준: 사용자 제공 10개 항목 검증 + 누락 이슈 + 리팩토링 우선순위

## 1) 기존 리뷰 항목 검증

| # | 항목 | 판정 | 근거 (코드라인) | 의견 |
|---|---|---|---|---|
| 1 | `next.config.js`에 `ignoreBuildErrors: true` | 동의 | `next.config.js:3-5` | 타입 오류가 있어도 프로덕션 빌드가 통과됨. 장애를 런타임으로 미루는 설정. |
| 2 | `any` 타입 20건 이상 남용 | 동의 | 예: `src/app/kits/[id]/page.tsx:10,131,420,441`, `src/lib/admin/useAdminList.ts:21,33,47,180,229,271`, `src/app/admin/mobile-suits/page.tsx:35,44,78` | `rg "\\bany\\b"` 기준 다수 확인(20건 훨씬 초과). 도메인 타입 안전성 저하. |
| 3 | 킷 상세 API에서 Supabase 15회 순차 호출(N+1) | 부분동의 | `src/app/api/kits/[id]/route.ts:15-19,39-44,50-55,64-68,73-78,81-85,93-100,118-125,146-151,156-160,168-172,175-183,200-210` | 순차 호출이 많은 건 사실. 다만 최대 호출 수는 조건부 포함 대략 13회 수준이며, 전형적 N+1(루프 내 쿼리 반복)이라기보다 "직렬 질의 과다"에 가까움. 성능 리스크는 큼. |
| 4 | `kits/[id]/page.tsx` vs `v2/page.tsx` 거의 동일(654줄 중 diff 9줄) | 동의 | `wc/diff` 결과: `src/app/kits/[id]/page.tsx` 654줄, `src/app/kits/[id]/v2/page.tsx` 655줄, 실질 diff는 헤더/요청 URL 중심 | 중복 유지비용 큼. 버그 수정 시 양쪽 동시 수정 필요. |
| 5 | 모든 공개 페이지가 `use client`라 SEO 불가 | 부분동의 | `src/app/page.tsx:4`, `src/app/kits/page.tsx:4`, `src/app/kits/[id]/page.tsx:2`, `src/app/kits/[id]/v2/page.tsx:3` | 공개 페이지가 전부 클라이언트 페칭 구조인 것은 사실. 다만 "SEO 완전 불가"는 과장이고, 실질적으로는 초기 HTML에 핵심 데이터 부재 가능성이 커 SEO 품질이 낮음. |
| 6 | API 캐싱 없음 | 동의 | 클라이언트 fetch 기본 사용: `src/app/kits/page.tsx:53`, `src/components/filter-panel.tsx:128`, `src/app/page.tsx:35`; API 응답 캐시 제어 부재: `src/app/api/kits/route.ts:118`, `src/app/api/filters/route.ts:87`, `src/app/api/stats/route.ts:41` | 캐시 정책(`revalidate`, `Cache-Control`, `unstable_cache`)이 없음. 핫 엔드포인트 부하 증가 가능. |
| 7 | `img` 사용, `next/image` 미사용 | 동의 | 예: `src/components/kit-card.tsx:29,39,49`, `src/app/kits/[id]/page.tsx:112,136,450,534`, `src/app/page.tsx:107-152` | 이미지 최적화/지연로딩/사이즈 제어 혜택 미활용. |
| 8 | `error.tsx` / `loading.tsx` 없음 | 동의 | `find src/app -name 'error.tsx' -o -name 'loading.tsx'` 결과 없음 | 라우트 레벨 장애/로딩 UX 경계 부재. |
| 9 | 필터 API 매번 전체 조회 | 동의 | 전체 옵션 조회: `src/app/api/filters/route.ts:13-67`; 클라이언트 마운트 시 매번 호출: `src/components/filter-panel.tsx:103-106,123-129` | 정적 성격 데이터인데 매 요청 DB 접근. 캐시/프리컴퓨트 대상. |
| 10 | Admin 페이지 코드 반복 | 동의 | 반복된 인증 로직 다수: 예 `src/app/admin/kits/new/page.tsx:69-74`, `src/app/admin/kits/[id]/edit/page.tsx:75-80`, `src/app/admin/series/new/page.tsx:36-41`, `src/app/admin/series/[id]/edit/page.tsx:36-41` + `rg` 결과 다수 파일 | 공통 훅/서버 가드로 올려야 유지보수 가능. |

## 2) 놓친 이슈 (추가)

### Critical
1. Admin 권한 판별이 클라이언트 `NEXT_PUBLIC_ADMIN_EMAIL` 의존
- 근거: `src/app/admin/layout.tsx:55`, 다수 Admin 페이지의 `checkAuth` (`src/app/admin/kits/new/page.tsx:71`, `src/app/admin/series/new/page.tsx:38` 등)
- 이유: 공개 환경변수와 클라이언트 체크에 의존하면 권한 모델이 취약해지기 쉬움. 서버/API 단 권한 검증을 단일화해야 함.

### High
2. 제안 승인 API의 실제 반영 쿼리 오류 미검증 + 트랜잭션 부재
- 근거: `src/app/api/suggestions/[id]/review/route.ts:83-98`에서 `update/insert` 결과 에러 체크 없음
- 이유: 상태는 `approved`로 바뀌었는데 실제 데이터 반영이 실패해 불일치 상태 발생 가능.

3. 에러 응답에 내부 에러 객체를 직접 노출
- 근거: `src/app/api/kits/[id]/route.ts:24`, `src/app/api/kits/[id]/route.ts:243`
- 이유: 운영환경에서 내부 스키마/오류 세부정보 노출 위험.

### Medium
4. V2 API에 과도한 디버그 로그 잔존
- 근거: `src/app/api/kits/[id]/v2/route.ts:14-16,213-257`
- 이유: 서버 로그 노이즈/비용 증가, 민감 데이터 노출 가능성.

5. 테스트 체계 부재
- 근거: `package.json` scripts에 `test` 없음 (`dev/build/start/lint`만 존재)
- 이유: 현재 규모/중복도에서 리팩토링 회귀 리스크가 큼.

## 3) 리팩토링 우선순위 제안

### P0 (즉시)
1. `ignoreBuildErrors` 제거, 타입 에러를 CI 차단 조건으로 전환.
2. Admin 권한 검증을 서버(미들웨어/서버 액션/API)로 일원화하고 클라이언트 이메일 비교 제거.
3. `suggestions/[id]/review` 승인 플로우를 트랜잭션화하고 모든 DB write 에러 처리 추가.

### P1 (단기)
1. `kits/[id]/page.tsx`와 `v2/page.tsx` 통합(공통 컴포넌트 + feature flag/쿼리 파라미터).
2. 상세 API 직렬 호출을 병렬화(`Promise.all`)하고 필요한 join/RPC로 왕복 횟수 축소.
3. `any` 집중 구간(상세 페이지, admin list 훅)부터 타입 모델 도입.

### P2 (중기)
1. 공개 페이지를 서버 컴포넌트 우선 구조로 전환하고 메타데이터/초기 콘텐츠 SSR.
2. 필터/통계/목록 API 캐싱(`revalidate`, `Cache-Control`, 태그 기반 invalidation).
3. `next/image` 전환(우선 트래픽 높은 카드/상세 이미지).
4. 라우트별 `error.tsx`, `loading.tsx` 추가.

### P3 (지속 개선)
1. Admin CRUD 패턴을 제네릭 훅/폼 스키마 기반으로 공통화.
2. E2E + API 통합 테스트 최소 골격 구축(상세/목록/승인 플로우 우선).

## 4) 총평

기존 리뷰는 전반적으로 정확합니다. 특히 1,2,4,6,7,8,9,10은 타당성이 높고 우선순위도 적절합니다. 3번과 5번은 문제 인식 자체는 맞지만 표현이 과장되어 있어, 각각 "N+1"보다 "직렬 질의 과다", "SEO 불가"보다 "SEO 품질 저하"로 정정하는 것이 기술적으로 정확합니다.
