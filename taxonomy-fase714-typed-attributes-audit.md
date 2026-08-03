# FASE 7.14 — Auditoria de cobertura `typed_attributes` (pré-engine)

**Fonte:** `/opt/limiar/limiar.db` (VPS) · script `scripts/audit_typed_attributes_coverage.py`  
**Princípio:** se a cobertura for insuficiente, a Compatibility Engine devolve **Desconhecido** — nunca inventa atributos nem parsers frágeis a partir do nome.

## Resumo executivo

| Leaf (slot PC) | Produtos | Com typed | Atributos úteis para regras | Decisão |
| --- | ---: | ---: | --- | --- |
| **cpu** | 116 | 100% | `socket` **33%**, `brand`/`series`/`model` | Socket só se ambos tiverem valor |
| **motherboard** | 318 | 100% | `chipset` 31%, `socket` **4,7%** | Socket quase sempre Desconhecido |
| **ram** | 333 | ~100% | **só `brand`** — sem DDR/capacidade/velocidade | DDR4/DDR5 → sempre Desconhecido |
| **gpu** | 248 | 100% | `chipset` 87%, `vram_gb` 81%; sem comprimento/TDP/PCIe útil | Comprimento/consumo → Desconhecido |
| **ssd** | 288 | 100% | `form_factor` 89%, `capacity_gb` 75%, `pcie_generation` 60% | M.2/SATA/NVMe via `form_factor` |
| **psu** | 144 | 100% | `wattage` **25%**; sem 80Plus/conectores | Potência só se wattage existir; sem TDP GPU/CPU → não marcar «insuficiente» |
| **case** | 0 (`case`) / **234 `pc_case`** | brand only | Sem ATX / clearance GPU / altura cooler | Formato/clearance → Desconhecido |
| **cooler** | 706 | 100% | **só `brand`** | Socket/altura → Desconhecido |

## Atributos pedidos vs realidade

| Regra desejada | Dados reais? | Comportamento v1 |
| --- | --- | --- |
| CPU ↔ MB socket | Parcial (CPU 33%, MB 5%) | Comparar **só** se ambos têm `socket`; senão Desconhecido |
| MB chipset | 31% | Informativo; não força incompatibilidade |
| RAM DDR4/DDR5 | **Inexistente** | Desconhecido |
| RAM velocidade/capacidade | **Inexistente** | Desconhecido |
| GPU comprimento | **Inexistente** | Desconhecido |
| GPU PCIe | ~0,8% | Desconhecido na prática |
| GPU VRAM / chipset | Bom | Score informativo / sugestões de alternativa |
| Fonte wattage | 25% | Se falta wattage → Desconhecido; sem TDP componentes → **não** inventar «fonte insuficiente» |
| Caixa ATX / GPU fit | **Inexistente** | Desconhecido |
| Cooler socket/altura | **Inexistente** | Desconhecido |
| SSD M.2 / SATA / NVMe | Bom (`form_factor`) | Classificar formato quando presente |

## Nota `pc_case`

O leaf `case` está vazio; caixas estão em `pc_case` (234). O engine mapeia o slot `case` → leaf `pc_case` para futuras regras — hoje só brand.

## Implicação para o score

Slots sem dados relevantes contribuem como **Desconhecido** (neutro), não como erro. Incompatível só quando há evidência tipada contraditória (ex.: sockets diferentes e ambos presentes).
