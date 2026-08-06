/************************************************************
 * Ascen Strategy — Onboarding: registro blindado (v2)
 *
 * Recebe cada cadastro do site e:
 *   1. grava numa planilha Google (criada automaticamente na 1ª vez)
 *   2. avisa por e-mail o dono do script
 *   3. repassa a resposta ao Google Forms oficial (formato correto)
 *   4. devolve confirmação real ({ok:true}) para o site
 *
 * Deduplica pelo id do cadastro — reenvios automáticos do site
 * não criam linha nem e-mail duplicados.
 ************************************************************/

const FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSfuR78ThPtFWKO7dwXkFlTOHTxJgxcKVa_tagyHOisxR3Y7vA/formResponse";
const NOME_PLANILHA = "Ascen Onboarding — Cadastros";
const CAMPOS = ["Nome","E-mail","Telefone","CPF","Endereço","Nacionalidade","Canal preferido",
  "Investe tradicional","Investe cripto","Tempo em cripto","Nível","Objetivos","Tem estratégia",
  "Detalhe estratégia","Valor carteira","% patrimônio","Tolerância a risco","Tem corretora",
  "Quais corretoras","Conhece DEX","Período","Frequência","Cupom","Info adicional","Declaração"];

function doGet() {
  return _json({ ok: true, ping: true, servico: "ascen-onboarding", versao: 2 });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    let dados = {};
    try { dados = JSON.parse(e.postData.contents); } catch (err) { return _json({ ok: false, erro: "json" }); }

    // Compatibilidade: a versão antiga do site mandava só o objeto "legível" plano
    const legivel = dados.legivel || dados;
    const id = dados.id || ("sem-id-" + new Date().getTime());
    const quando = dados.quando || new Date().toISOString();

    const aba = _aba();

    // Dedupe: reenvio do mesmo cadastro responde ok sem gravar de novo
    const ids = aba.getRange(1, 1, Math.max(aba.getLastRow(), 1), 1).getValues().map(function (r) { return String(r[0]); });
    if (ids.indexOf(id) !== -1) return _json({ ok: true, duplicado: true, id: id });

    // Repasse ao Google Forms (só se o site ainda não enviou direto)
    let formStatus = "pulado";
    if (dados.payload && !dados.form_ja_enviado) {
      formStatus = _repassarAoForms(dados.payload);
    }

    // Planilha (registro principal)
    const linha = [id, quando].concat(CAMPOS.map(function (c) { return legivel[c] || ""; })).concat([formStatus]);
    aba.appendRow(linha);

    // E-mail de aviso para o dono do script
    let emailStatus = "ok";
    try {
      MailApp.sendEmail({
        to: Session.getEffectiveUser().getEmail(),
        subject: "🟢 Novo Onboarding — " + (legivel["Nome"] || "sem nome"),
        body: _corpoEmail(legivel, id, quando, formStatus)
      });
    } catch (err) { emailStatus = "falhou"; }

    return _json({ ok: true, id: id, form: formStatus, email: emailStatus });
  } catch (err) {
    return _json({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function _aba() {
  const props = PropertiesService.getScriptProperties();
  const planId = props.getProperty("PLANILHA_ID");
  let plan = null;
  if (planId) {
    try { plan = SpreadsheetApp.openById(planId); } catch (e) { plan = null; }
  }
  if (!plan) {
    plan = SpreadsheetApp.create(NOME_PLANILHA);
    props.setProperty("PLANILHA_ID", plan.getId());
  }
  let aba = plan.getSheetByName("Cadastros");
  if (!aba) {
    aba = plan.getSheets()[0];
    aba.setName("Cadastros");
    aba.appendRow(["ID", "Recebido em"].concat(CAMPOS).concat(["Forms"]));
    aba.setFrozenRows(1);
  }
  return aba;
}

function _repassarAoForms(payload) {
  try {
    const partes = [];
    Object.keys(payload).forEach(function (k) {
      const v = payload[k];
      const vals = Array.isArray(v) ? v : [v];
      vals.forEach(function (x) {
        if (x !== "" && x !== null && x !== undefined) {
          partes.push(encodeURIComponent(k) + "=" + encodeURIComponent(x));
        }
      });
    });
    const resp = UrlFetchApp.fetch(FORM_ACTION, {
      method: "post",
      contentType: "application/x-www-form-urlencoded",
      payload: partes.join("&"),
      muteHttpExceptions: true,
      followRedirects: true
    });
    return resp.getResponseCode() === 200 ? "ok" : "falhou-" + resp.getResponseCode();
  } catch (err) { return "falhou"; }
}

function _corpoEmail(legivel, id, quando, formStatus) {
  let corpo = "Novo cadastro de onboarding recebido.\n\n";
  CAMPOS.forEach(function (c) { if (legivel[c]) corpo += c + ": " + legivel[c] + "\n"; });
  corpo += "\n---\nID: " + id + "\nRecebido em: " + quando + "\nRepasse ao Google Forms: " + formStatus;
  try {
    const planId = PropertiesService.getScriptProperties().getProperty("PLANILHA_ID");
    if (planId) corpo += "\nPlanilha: " + SpreadsheetApp.openById(planId).getUrl();
  } catch (e) {}
  return corpo;
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
