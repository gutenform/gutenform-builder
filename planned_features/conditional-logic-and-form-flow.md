# Conditional Logic & Form Flow – Plan

Dieses Dokument beschreibt den Plan für ein System zur **Conditional Logic** (bedingte Anzeige/Validierung) für Felder und Steps sowie – in einer zweiten Phase – ein **Form Flow Canvas** zur visuellen Abbildung des Formularablaufs.

---

## Phasen-Übersicht

| Phase | Inhalt | Reihenfolge |
|-------|--------|-------------|
| **Phase 1** | **Conditional Logic** (ohne Canvas): Field-Level, Step-Level, Required-Logik – alles im Block-Editor und Frontend umsetzbar | Zuerst |
| **Phase 2** | **Form Flow Canvas**: Visueller Flow-Editor mit React Flow (Steps/Felder als Nodes, Drag & Drop) | Danach, baut auf Phase 1 auf |

Phase 1 liefert das vollständige Feature „Conditional Logic“; Phase 2 ergänzt die visuelle Bearbeitung des Flows auf einem Canvas.

---

## 1. Übersicht

### Ziele

- **Field-Level:** Felder können abhängig vom Wert anderer Felder ein-/ausgeblendet werden; z. B. Select-Vorauswahl aus anderem Feld.
- **Step-Level:** Ganze Steps können abhängig vom Wert eines Feldes ein-/ausgeblendet werden.
- **Required:** Felder bleiben konzeptionell „required“, werden aber nur validiert, wenn die Conditional Logic sie erreicht (sichtbar macht).
- **Phase 2:** Form Flow Canvas mit dragbaren Elementen (Step-Ebene, Field-Ebene), inspiriert von Form Flow, technisch z. B. mit **React Flow**.

### Abhängigkeiten zur bestehenden Architektur

- **Form:** `gutenform/form` mit `activeStep`, `formId`, Context.
- **Steps:** `gutenform/step` mit `title`, `stepId`; Sichtbarkeit im Editor/Frontend über `gutenform-step--active` / `gutenform-step--hidden` und `display`.
- **Felder:** Input, Select, Textarea etc. mit `FieldControls` (name, id, placeholder, required), Select mit `defaultValue` und `options`.
- **Frontend:** `view.ts` – Multi-Step-Logik (`initMultiStepForm`, `goToStep`), Validierung `validateStep` (required-Felder pro Step), Submit/Progress.

---

## Phase 1: Conditional Logic (ohne Canvas)

Phase 1 umfasst die komplette Conditional Logic für Felder und Steps ausschließlich über Block-Editor-Controls und Frontend-Auswertung – **ohne** Form Flow Canvas.

---

### Phase 1.1: Conditional Logic auf Feldebene

#### Todos

- [x] Datenmodell: `conditionalShow` und `defaultValueFromField` in Block-Attributen (globalField / Select) definieren
- [x] Hook/Utility: Formular-Feldliste aus Block-Tree ermitteln (für Dropdown „Abhängig von Feld“)
- [x] Inspector-Controls: „Abhängig von Feld“ (Quellfeld + Operator + optional Wert) in FieldControls oder pro Block
- [x] Inspector-Controls (Select): „Vorauswahl aus Feld“ – Dropdown zur Auswahl eines anderen Feldes
- [x] Save: `data-conditional-show` und `data-default-value-from-field` an Feld-Container ausgeben
- [x] View: `evaluateConditions()` für Felder – Quellwert lesen, Operator anwenden, Sichtbarkeit setzen
- [x] View: Listener auf `change`/`input` der Quellfelder, Sichtbarkeit/Vorauswahl aktualisieren
- [x] View: Select „Vorauswahl aus Feld“ – Wert des Quellfelds ins Select übernehmen

#### Controls in den Blöcken

- **Neue Controls (Inspector/Sidebar)** für alle relevanten Feld-Blöcke (Input, Select, Textarea, ggf. File, …):
  - **„Abhängig von Feld“** (Conditional Logic): Dropdown/Combobox zur Auswahl eines **anderen Formularfeldes** (aus demselben Formular).
  - **Bedingung:** Operator (z. B. „ist gleich“, „ist nicht leer“, „enthält“) + optional Vergleichswert.
  - Für **Select** zusätzlich: **„Vorauswahl aus Feld“** – ein anderes Feld auswählen, dessen **aktueller Wert** als `defaultValue` des Selects verwendet wird (kein fester String, sondern dynamisch aus anderem Feld).

#### Datenmodell (Block-Attribute)

Vorschlag pro Feldblock:

```ts
// Beispiel: Erweiterung GlobalFieldAttributes oder blockspezifisch
conditionalShow?: {
  sourceFieldName: string;   // name des referenzierten Feldes
  operator: 'equals' | 'notEquals' | 'isEmpty' | 'isNotEmpty' | 'contains';
  value?: string;           // optional, z.B. für "equals"
};
// Für Select: Vorauswahl aus anderem Feld
defaultValueFromField?: string;  // name des Feldes, dessen Wert als defaultValue genutzt wird
```

- Im Editor: Liste der Felder aus dem Formular (über Block-Tree/Context) ermitteln und im Dropdown anbieten.
- `sourceFieldName` sollte auf `name` der Blöcke referenzieren (stabil auch bei Template-Änderungen).

#### Frontend (view.ts / Save)

- Beim **Rendern (Save)**:
  - `data-*`-Attribute für Conditional Logic an die Feld-Container schreiben (z. B. `data-conditional-show`, JSON).
  - Bei Select: `data-default-value-from-field` setzen.
- Im **view.js/view.ts**:
  - Nach DOMContentLoaded / bei Änderungen: alle Felder mit `data-conditional-show` auswerten.
  - Werte der Quellfelder auslesen (name → `form.querySelector('[name="..."]')`), Operator anwenden, Sichtbarkeit (z. B. `display: none` / Klasse) setzen.
  - Bei **defaultValueFromField**: Wert des Quellfelds lesen und ins Select als ausgewählte Option übernehmen (und `change` feuern).
  - Listener auf `change`/`input` der Quellfelder, damit sich Sichtbarkeit/Vorauswahl sofort aktualisiert.

#### Required-Logik (Felder)

- [x] `validateStep()` anpassen: Nur **sichtbare** Felder (nicht conditional-hidden) als required prüfen
- [x] Submit: Versteckte Felder nicht als „fehlend“ werten; ggf. nicht mitsenden oder als leer ignorieren

- Felder mit Conditional Logic können weiterhin `required: true` haben.
- **Validierung** (`validateStep`): Nur Felder prüfen, die **sichtbar** sind (z. B. keine `display: none` und keine Klasse „conditional-hidden“). Entweder:
  - Vor dem Prüfen alle bedingt versteckten Felder ermitteln und von der Required-Prüfung ausnehmen, oder
  - Temporär `required` von versteckten Feldern entfernen (nur für Validierung, nicht dauerhaft im DOM).
- Beim **Submit**: Versteckte Felder nicht als „fehlend“ werten; ggf. nicht mitsenden oder als leer ignorieren.

---

### Phase 1.2: Step-Level Conditional Logic

#### Todos

- [x] Step block.json: Attribut `conditionalShow` (sourceFieldName, operator, value) ergänzen
- [x] Step Inspector-Controls: „Step nur anzeigen wenn“ – Quellfeld + Operator + optional Wert
- [x] Step Save: `data-conditional-show` am Step-Container ausgeben
- [x] View: Sichtbare Steps berechnen (`getVisibleSteps(formEl)`), `visibleStepIndices` pflegen
- [x] View: `goToStep` / Navigation so anpassen, dass nur sichtbare Steps durchlaufen werden
- [x] View: „Weiter“/„Zurück“ mappt auf Index in sichtbarer Step-Liste
- [x] Progress-Block: Nur sichtbare Steps anzeigen (Bubbles/Nummerierung)
- [x] Validierung: Nur aktuell sichtbarer Step wird mit `validateStep` geprüft

#### Controls am Step-Block

- Im **Step-Block** (`gutenform/step`) neue Inspector-Controls:
  - **„Step nur anzeigen wenn“**: Ein Quellfeld + Operator + optional Wert (analog zu Feldern).
  - Ein Step kann eine **einzige** Bedingung haben (später evtl. AND/OR erweiterbar).

#### Datenmodell Step

```ts
// Step-Attribute (block.json + Edit)
conditionalShow?: {
  sourceFieldName: string;
  operator: 'equals' | 'notEquals' | 'isEmpty' | 'isNotEmpty' | 'contains';
  value?: string;
};
```

- Im **Save**: Step-Container mit `data-conditional-show` (JSON) ausgeben.

#### Frontend (Multi-Step + Steps sichtbar/unsichtbar)

- **Schwierigkeit:** Die aktuelle Logik nutzt eine **feste Step-Liste** und einen **aktuellen Index** (`currentStep`). Wenn Steps bedingt ausgeblendet werden, müssen „unsichtbare“ Steps beim Navigieren übersprungen werden.
- **Vorgehen:**
  - Beim Start und nach jeder Änderung von Quellfeldwerten: **sichtbare Steps** berechnen (Steps, deren Bedingung erfüllt ist).
  - **Step-Indizes** für die Navigation nur über sichtbare Steps laufen lassen (z. B. Array `visibleStepIndices`).
  - `goToStep(formEl, steps, stepIndex)` erweitern: Statt `stepIndex` den **echten** DOM-Index verwenden (nur sichtbare Steps anzeigen, Rest `display: none`).
  - „Weiter“/„Zurück“ erhöht/verringert den Index in der **sichtbaren** Liste und mappt auf den echten Step.
  - Progress-Block (Bubbles etc.): Nur sichtbare Steps anzeigen; ggf. Nummerierung anpassen.
- **Validierung:** Nur der **aktuell sichtbare** Step wird mit `validateStep` geprüft.
- **Submit:** Nur sichtbare Steps und deren Felder in die finale Payload aufnehmen (oder weiterhin alle Felder mitsenden, Backend entscheidet – je nach Produktwunsch).

---

### Phase 1.3: Required-Logik konsistent

#### Todos

- [x] Zentrale Hilfsfunktion: `isFieldVisible(fieldEl, formEl)` bzw. `getVisibleSteps(formEl)` (falls noch nicht in 1.1/1.2)
- [x] `validateStep(stepEl)` final: Nur sichtbare Felder mit `required` prüfen; Felder in ausgeblendeten Steps ignorieren
- [ ] Optional: Editor-Tooltip bei „Required“: „Wird nur validiert, wenn das Feld angezeigt wird.“

- **Regel:** Ein Feld gilt als „required“ nur, wenn es **sichtbar** ist (Conditional Logic erfüllt).
- **Editor:** UI kann unverändert „Required“ anzeigen; Tooltip/Help-Text optional: „Wird nur validiert, wenn das Feld angezeigt wird.“
- **Frontend:**
  - Zentrale Hilfsfunktion: `isFieldVisible(fieldEl, formEl)` bzw. `getVisibleSteps(formEl)`.
  - `validateStep(stepEl)` so anpassen, dass nur sichtbare Felder mit `required` geprüft werden.
  - Keine Validierung für Felder in bedingt ausgeblendeten Steps.

---

### Phase 1 – Abschluss

- [ ] Dokumentation / Edge Cases (z. B. Zirkelbezüge vermeiden, Reihenfolge der Auswertung)
- [x] i18n: Neue Strings in PHP (camelCase-Keys) für alle neuen Controls/Labels

---

## Phase 2: Form Flow Canvas

Phase 2 baut auf der fertigen Conditional Logic (Phase 1) auf und fügt einen visuellen **Form Flow Canvas** hinzu – z. B. mit React Flow.

#### Todos (Phase 2)

- [ ] React Flow einbinden (`reactflow` / `@xyflow/react`), Canvas-Komponente mit MiniMap, Controls, Background
- [ ] Entscheidung: Canvas-Ort (Sidebar-Tab Form-Block, Modal oder eigene Admin-Seite)
- [ ] Custom Node-Typen: Step-Node, Field-Node
- [ ] Mapping Form → Flow: aus Form-Block-Struktur Steps/Felder auslesen, Nodes/Edges erzeugen
- [ ] Mapping Flow → Form: Änderungen im Canvas in Block-Struktur zurückschreiben (Reihenfolge, Zuordnung)
- [ ] Conditional Logic im Canvas: Edges von Feld zu Step mit Label „Wenn Wert = X“ → `conditionalShow` am Step
- [ ] Optional: Nested/Subgraph pro Step für Felder; Performance bei großen Formularen prüfen

---

### 2.1 Idee

- Ein **Canvas** (neue View/Modal/Tab im Form-Editor oder eigene Seite), auf dem der **Flow** des Formulars dargestellt und bearbeitet werden kann.
- **Ebenen:**
  - **Step-Ebene:** Jeder Step ein Node (z. B. Karte mit Step-Titel).
  - **Field-Ebene:** Pro Step die Felder als Child-Nodes oder als zweite Ebene (Subgraph pro Step).
- **Drag & Drop:** Steps/Felder anordnen, Verbindungen („Wenn X, dann Step Y“) optional abbildbar.
- **Referenz:** „Form Flow“ (z. B. FormFlow-basierte Builder) als UX-Vorlage.

### 2.2 Technische Umsetzung: React Flow

- **Library:** [React Flow](https://reactflow.dev/) (MIT, weit verbreitet, Typeform/Stripe etc.).
- **Integration:** Entweder im Block-Editor (iframe/Modal) oder in der Admin-App (eigene Route), je nach Wo die Form-Struktur verwaltet wird.
- **Daten:**
  - **Nodes:** Steps = eigene Node-Type (z. B. `stepNode`), Felder = eigene Node-Type (z. B. `fieldNode`).
  - **Edges:** Standard-„Next Step“ oder „Conditional Branch“ (von Feldwert zu Step).
  - Sync: Zwei Richtungen – **Canvas → Block-Struktur** (Nodes/Edges in Gutenberg-Blocks übersetzen) und **Block-Struktur → Canvas** (beim Öffnen des Canvas aus dem Form-Block Tree die Nodes/Edges erzeugen).

### 2.3 Grober Implementierungsplan

1. **Neues Paket/Route:** z. B. `FormFlowCanvas` in `src/` (admin oder blocks).
2. **React Flow einbinden:** `reactflow` (und ggf. `@xyflow/react`) installieren, Canvas mit MiniMap, Controls, Background.
3. **Node-Typen:** Custom Nodes für Step und Field; Felder optional als Subgraph pro Step (nested React Flow oder gruppierte Nodes).
4. **Mapping Form → Flow:**
   - Aus `getBlocks(formClientId)` Steps und innere Blöcke (Input, Select, …) auslesen.
   - Pro Step einen Step-Node, pro Feld einen Field-Node; Positions-Defaults (z. B. Layout-Algorithmus oder feste Offsets).
5. **Mapping Flow → Form:**
   - Bei Änderung im Canvas (Reihenfolge Steps, Zuordnung Felder zu Steps): Block-Struktur per `replaceBlocks` / `updateBlockAttributes` anpassen (vorsichtig, um bestehende Attribute zu erhalten).
6. **Conditional Logic im Canvas:** Edges von einem Feld zu einem Step mit Label „Wenn Wert = X“; beim Sync in `conditionalShow` am Step übersetzen.
7. **Performance:** Bei großen Formularen nur sichtbare Steps laden oder Virtualisierung prüfen.

### 2.4 Offene Punkte

- Wo genau der Canvas lebt: Sidebar-Tab im Form-Block, eigenes Modal, oder eigene Admin-Seite.
- Ob die Block-Struktur die „Single Source of Truth“ bleibt und der Canvas nur eine View/Editor-Hilfe ist, oder ob der Canvas zur primären Bearbeitung wird (komplexer Sync).
- Nested React Flow für Felder pro Step vs. flache Liste mit Gruppen-Visualisierung.

---

## 6. Technische Schnittstellen (Kurz)

### 6.1 Editor: Feldliste für Dropdowns

- Aus dem Form-Block alle Descendant-Blöcke mit `name`-Attribut sammeln (über `getBlocks` rekursiv oder Block-Context).
- Für Step-Conditions: gleiche Liste; für „Vorauswahl aus Feld“ nur Felder, die einen einfachen Wert liefern (Input, Select, evtl. Textarea).

### 6.2 Save: data-Attribute

- Feld-Blöcke: `data-conditional-show`, `data-default-value-from-field` (Select).
- Step-Block: `data-conditional-show`.
- Format z. B. JSON-String für Objekte, damit view.js parsen kann.

### 6.3 View: Auswertung

- Eine zentrale Funktion `evaluateConditions(formEl)`:
  - Liest alle `[data-conditional-show]` (Felder + Steps).
  - Holt aktuelle Formularwerte (name → value).
  - Wendet Operatoren an, setzt Sichtbarkeit (Klasse/display).
  - Für Steps: Liste der sichtbaren Step-Indizes aktualisieren und Navigation/Progress aktualisieren.
- Aufruf: bei `DOMContentLoaded`, bei `change`/`input` auf dem Formular (debounced optional).

---

## 7. Reihenfolge & Meilensteine

### Phase 1: Conditional Logic (ohne Canvas)

| Schritt | Inhalt | Abhängigkeit |
|---------|--------|--------------|
| 1.1 | Datenmodell + Inspector-Controls (Feld: „Abhängig von“, Select: „Vorauswahl aus Feld“) | – |
| 1.2 | Save: data-Attribute ausgeben | 1.1 |
| 1.3 | View: Auswertung Conditional Logic Felder + defaultValueFromField | 1.2 |
| 1.4 | Required nur für sichtbare Felder | 1.3 |
| 1.5 | Step: Datenmodell + Controls „Step nur anzeigen wenn“ | 1.1 |
| 1.6 | View: sichtbare Steps, Navigation über visibleStepIndices, goToStep anpassen | 1.3, 1.5 |
| 1.7 | Progress-Block: nur sichtbare Steps | 1.6 |
| 1.8 | Required-Logik konsistent, Dokumentation, i18n | 1.7 |

### Phase 2: Form Flow Canvas

| Schritt | Inhalt | Abhängigkeit |
|---------|--------|--------------|
| 2.1 | React Flow einbinden, Canvas-Komponente (Ort festlegen) | Phase 1 abgeschlossen |
| 2.2 | Node-Typen (Step, Field), Mapping Form → Flow | 2.1 |
| 2.3 | Mapping Flow → Form, Conditional Logic im Canvas abbilden | 2.2 |
| 2.4 | Feinschliff, Performance, evtl. Nested/Subgraph | 2.3 |

---

## 8. Referenzen

- **React Flow:** https://reactflow.dev/ (Concepts, Building a Flow, Examples).
- **Form Flow:** Als UX-Referenz für dragbare Steps/Felder und visuellen Flow (konkrete Produkt-URL bei Bedarf ergänzen).
- **Bestehender Code:** `src/blocks/form/view.ts` (initMultiStepForm, goToStep, validateStep), `src/blocks/step/edit.tsx`, `FieldControls`, `blockTypes/globalField.ts`, `blockTypes/select.ts`.

---

*Stand: Februar 2026. Bei Umsetzung die bestehende i18n-Strategie (PHP-Strings, camelCase-Keys in JS) und Projektstruktur (blocks, components, lib) beibehalten.*
