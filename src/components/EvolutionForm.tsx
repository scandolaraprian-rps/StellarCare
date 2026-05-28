import { useState, useMemo, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  Stethoscope,
  Save,
  FileText,
  CheckCircle2,
  User,
  Heart,
  Thermometer,
  Wind,
  Plus,
  ArrowRight,
  ArrowLeft,
  Lock,
  Clock,
  Sparkles,
  Layers,
  HeartIcon,
  Check,
  FileIcon,
  BookOpen
} from "lucide-react";
import { motion } from "motion/react";
import { Patient, MetricPoint } from "../types";

interface EvolutionFormProps {
  patients: Patient[];
  onSign: (patientId: string, metric: MetricPoint) => void;
}

/* Define types for clinical presets */
interface ClinicalPreset {
  label: string;
  icon: string;
  temp: string;
  pa_sys: string;
  pa_dia: string;
  fc: string;
  fr: string;
  spo2: string;
  pain: string;
  hgt: string;
  neurologico: "lucid" | "confused" | "somnolent" | "comatose";
  respiratorio: "eupnea" | "dyspnea" | "tachypnea" | "oxygen_support";
  cardiovascular: "normocardia" | "tachycardia" | "bradycardia" | "instable";
  estado_geral: "stable" | "dehydrated" | "pallid" | "lesion";
  dispositivos: "none" | "avp" | "catheter" | "svd" | "sne";
  hygiene: boolean;
  decubitus: boolean;
  medication: boolean;
  dressing: boolean;
  diuresis: boolean;
  glycemia: boolean;
  diet: boolean;
  mobility: boolean;
}

export function EvolutionForm({ patients, onSign }: EvolutionFormProps) {
  const [step, setStep] = useState(1);
  const [signingProgress, setSigningProgress] = useState(0);
  const [isSigning, setIsSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [integrityHash, setIntegrityHash] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || "");

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) || patients[0],
    [patients, selectedPatientId]
  );

  const [form, setForm] = useState({
    temp: "36.6",
    pa_sys: "120",
    pa_dia: "80",
    fc: "74",
    fr: "16",
    spo2: "98",
    pain: "1",
    hgt: "95",
    neurologico: "lucid" as "lucid" | "confused" | "somnolent" | "comatose",
    respiratorio: "eupnea" as "eupnea" | "dyspnea" | "tachypnea" | "oxygen_support",
    cardiovascular: "normocardia" as "normocardia" | "tachycardia" | "bradycardia" | "instable",
    estado_geral: "stable" as "stable" | "dehydrated" | "pallid" | "lesion",
    dispositivos: "none" as "none" | "avp" | "catheter" | "svd" | "sne",
    hygiene: false,
    decubitus: false,
    medication: false,
    dressing: false,
    diuresis: false,
    glycemia: false,
    diet: true,
    mobility: true,
    observations: "",
  });

  /* 4 Premium clinical presets for doctors and demo-testing */
  const presets: Record<string, ClinicalPreset> = {
    estavel: {
      label: "Paciente Estável (Padrão)",
      icon: "💚",
      temp: "36.6",
      pa_sys: "120",
      pa_dia: "80",
      fc: "72",
      fr: "16",
      spo2: "99",
      pain: "0",
      hgt: "92",
      neurologico: "lucid",
      respiratorio: "eupnea",
      cardiovascular: "normocardia",
      estado_geral: "stable",
      dispositivos: "none",
      hygiene: true,
      decubitus: false,
      medication: false,
      dressing: false,
      diuresis: true,
      glycemia: false,
      diet: true,
      mobility: true,
    },
    febril: {
      label: "Alerta de Hipertermia",
      icon: "🔥",
      temp: "38.5",
      pa_sys: "135",
      pa_dia: "85",
      fc: "106",
      fr: "21",
      spo2: "95",
      pain: "4",
      hgt: "115",
      neurologico: "somnolent",
      respiratorio: "tachypnea",
      cardiovascular: "tachycardia",
      estado_geral: "stable",
      dispositivos: "avp",
      hygiene: false,
      decubitus: true,
      medication: true,
      dressing: false,
      diuresis: false,
      glycemia: true,
      diet: false,
      mobility: false,
    },
    hipoxia: {
      label: "Hipóxia e Crítico O2",
      icon: "🚨",
      temp: "36.2",
      pa_sys: "95",
      pa_dia: "58",
      fc: "118",
      fr: "26",
      spo2: "89",
      pain: "3",
      hgt: "104",
      neurologico: "confused",
      respiratorio: "oxygen_support",
      cardiovascular: "instable",
      estado_geral: "dehydrated",
      dispositivos: "catheter",
      hygiene: false,
      decubitus: true,
      medication: true,
      dressing: true,
      diuresis: true,
      glycemia: false,
      diet: false,
      mobility: false,
    },
    dor_pos_op: {
      label: "Dor Aguda Pós-Op",
      icon: "💥",
      temp: "36.9",
      pa_sys: "148",
      pa_dia: "94",
      fc: "96",
      fr: "19",
      spo2: "98",
      pain: "9",
      hgt: "130",
      neurologico: "lucid",
      respiratorio: "eupnea",
      cardiovascular: "normocardia",
      estado_geral: "stable",
      dispositivos: "avp",
      hygiene: true,
      decubitus: false,
      medication: true,
      dressing: true,
      diuresis: true,
      glycemia: false,
      diet: true,
      mobility: false,
    }
  };

  const applyPreset = (key: keyof typeof presets) => {
    if (signed) return;
    const p = presets[key];
    setForm({
      temp: p.temp,
      pa_sys: p.pa_sys,
      pa_dia: p.pa_dia,
      fc: p.fc,
      fr: p.fr,
      spo2: p.spo2,
      pain: p.pain,
      hgt: p.hgt,
      neurologico: p.neurologico,
      respiratorio: p.respiratorio,
      cardiovascular: p.cardiovascular,
      estado_geral: p.estado_geral,
      dispositivos: p.dispositivos,
      hygiene: p.hygiene,
      decubitus: p.decubitus,
      medication: p.medication,
      dressing: p.dressing,
      diuresis: p.diuresis,
      glycemia: p.glycemia,
      diet: p.diet,
      mobility: p.mobility,
      observations: form.observations,
    });
  };

  /* Validation & Status of metrics * */
  const classifications = useMemo(() => {
    const tempNum = parseFloat(form.temp) || 36.5;
    const spo2Num = parseFloat(form.spo2) || 98;
    const painNum = parseFloat(form.pain) || 0;
    const sysNum = parseFloat(form.pa_sys) || 120;
    const diaNum = parseFloat(form.pa_dia) || 80;
    const fcNum = parseFloat(form.fc) || 75;

    let tempStatus = { text: "Normotermia", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (tempNum >= 38.3) {
      tempStatus = { text: "Hipertermia / Febre Alta ⚠️", color: "text-rose-700 bg-rose-50 border-rose-200 animate-pulse" };
    } else if (tempNum >= 38.0) {
      tempStatus = { text: "Estado Febril ⚠️", color: "text-amber-700 bg-amber-50 border-amber-200" };
    } else if (tempNum < 35.5) {
      tempStatus = { text: "Hipotermia ❄️", color: "text-sky-700 bg-sky-50 border-sky-200" };
    }

    let spo2Status = { text: "Saturação Estável", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (spo2Num < 90) {
      spo2Status = { text: "Hipóxia Crítica! 🚨", color: "text-rose-700 bg-rose-50 border-rose-300 animate-pulse font-extrabold" };
    } else if (spo2Num < 93) {
      spo2Status = { text: "Alerta de Hipóxia ⚠️", color: "text-amber-700 bg-amber-50 border-amber-200" };
    }

    let painStatus = { text: "Ausente", color: "text-slate-500 bg-slate-50 border-slate-200" };
    if (painNum >= 8) {
      painStatus = { text: "Dor Severe 💥", color: "text-rose-700 bg-rose-100 border-rose-300 font-extrabold" };
    } else if (painNum >= 4) {
      painStatus = { text: "Dor Moderada / Monitorar", color: "text-amber-700 bg-amber-50 border-amber-200" };
    } else if (painNum > 0) {
      painStatus = { text: "Dor Leve", color: "text-emerald-700 bg-emerald-50 border-emerald-100" };
    }

    let bpStatus = { text: "Normotensão", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (sysNum >= 140 || diaNum >= 90) {
      bpStatus = { text: "Pressão Elevada / Hipertensão ⚠️", color: "text-amber-700 bg-amber-50 border-amber-200" };
    } else if (sysNum < 90 || diaNum < 60) {
      bpStatus = { text: "Hipotensão Arterial", color: "text-sky-700 bg-sky-50 border-sky-200" };
    }

    let fcStatus = { text: "Eucardia (Normal)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (fcNum >= 100) {
      fcStatus = { text: "Taquicardia ⚠️", color: "text-amber-700 bg-amber-50 border-amber-200" };
    } else if (fcNum < 60) {
      fcStatus = { text: "Bradicardia", color: "text-sky-700 bg-sky-50 border-sky-200" };
    }

    return { temp: tempStatus, spo2: spo2Status, pain: painStatus, bp: bpStatus, fc: fcStatus };
  }, [form.temp, form.spo2, form.pain, form.pa_sys, form.pa_dia, form.fc]);

  /* Calculate NEWS 2 (National Early Warning Score) Score in real-time */
  const news2ScoreInfo = useMemo(() => {
    const frNum = parseInt(form.fr) || 16;
    const spo2Num = parseInt(form.spo2) || 98;
    const tempNum = parseFloat(form.temp) || 36.6;
    const sysNum = parseInt(form.pa_sys) || 120;
    const fcNum = parseInt(form.fc) || 74;
    const consciousness = form.neurologico;

    let score = 0;

    // FR Points
    if (frNum <= 8) score += 3;
    else if (frNum >= 9 && frNum <= 11) score += 1;
    else if (frNum >= 12 && frNum <= 20) score += 0;
    else if (frNum >= 21 && frNum <= 24) score += 2;
    else if (frNum >= 25) score += 3;

    // SpO2 Points
    if (spo2Num >= 96) score += 0;
    else if (spo2Num === 94 || spo2Num === 95) score += 1;
    else if (spo2Num === 92 || spo2Num === 93) score += 2;
    else if (spo2Num <= 91) score += 3;

    // Temp Points
    if (tempNum <= 35.0) score += 3;
    else if (tempNum >= 35.1 && tempNum <= 36.0) score += 1;
    else if (tempNum >= 36.1 && tempNum <= 38.0) score += 0;
    else if (tempNum >= 38.1 && tempNum <= 39.0) score += 1;
    else if (tempNum >= 39.1) score += 2;

    // Systolic Blood Pressure Points
    if (sysNum <= 90) score += 3;
    else if (sysNum >= 91 && sysNum <= 100) score += 2;
    else if (sysNum >= 101 && sysNum <= 110) score += 1;
    else if (sysNum >= 111 && sysNum <= 219) score += 0;
    else if (sysNum >= 220) score += 3;

    // Heart Rate Points
    if (fcNum <= 40) score += 3;
    else if (fcNum >= 41 && fcNum <= 50) score += 1;
    else if (fcNum >= 51 && fcNum <= 90) score += 0;
    else if (fcNum >= 91 && fcNum <= 110) score += 1;
    else if (fcNum >= 111 && fcNum <= 130) score += 2;
    else if (fcNum >= 131) score += 3;

    // Consciousness Points (lucid is 0, any other is 3)
    if (consciousness !== "lucid") score += 3;

    let level = "Baixo Risco";
    let color = "bg-emerald-600 text-white";
    let border = "border-emerald-300";
    let recommendation = "Manter monitoramento clínico assistencial de rotina e registrar evolução periódica padrão.";

    if (score >= 7) {
      level = "Risco Crítico (Alto)";
      color = "bg-rose-600 text-white animate-pulse";
      border = "border-rose-400";
      recommendation = "Protocolo de Emergência Imediato! Elevar o leito, suprir oxigênio SOS de fluxo rápido se saturação < 93% e contactar o médico plantonista urgentemente.";
    } else if (score >= 5) {
      level = "Risco Médio (Alerta)";
      color = "bg-amber-500 text-white";
      border = "border-amber-300";
      recommendation = "Informar enfermeiro líder do plantão. Aumentar frequência de verificação corporal e monitorização para cada 1h.";
    } else if (score > 0) {
      level = "Risco Baixo-Médio";
      color = "bg-[#3683F8] text-white";
      border = "border-sky-300";
      recommendation = "Quadro geral satisfatório com alterações leves. Reavaliar em 4 a 6 horas conforme regras assistenciais COFEN.";
    }

    return { score, level, color, border, recommendation };
  }, [form.temp, form.fr, form.spo2, form.pa_sys, form.fc, form.neurologico]);

  /* Build professional Portuguese clinical evolution text prose */
  const computedEvolutionProse = useMemo(() => {
    if (!selectedPatient) return "";

    const t = form.temp ? `${form.temp}°C` : "não aferida";
    const pa = form.pa_sys && form.pa_dia ? `${form.pa_sys}/${form.pa_dia} mmHg` : "não verificada";
    const spo2 = form.spo2 ? `${form.spo2}%` : "não mapeada";
    const fc = form.fc ? `${form.fc} bpm` : "não auferido";
    const fr = form.fr ? `${form.fr} irpm` : "não verificado";
    const painScale = form.pain ? `escala de dor calculada em ${form.pain}/10` : "dor ausente";
    const hgtVal = form.hgt ? `HGT: ${form.hgt} mg/dL` : "";

    const neuro = {
      lucid: "consciente, vigil, lúcido e plenamente orientado no tempo e no espaço",
      confused: "consciente, porém desorientado no tempo, com agitação psicomotora leve",
      somnolent: "hipoativo, sonolento, mas responsivo a estímulos verbais diretos",
      comatose: "torporoso sob rebaixamento severo do nível de consciência, irresponsivo verbalmente"
    }[form.neurologico];

    const resp = {
      eupnea: "padrão respiratório eupneico em ar ambiente",
      dyspnea: "apresentando esforço respiratório leve (dispneia leve evidente)",
      tachypnea: "taquipneico e sob acompanhamento de padrão respiratório",
      oxygen_support: "necessitado de suporte complementar de O2 sob cateter nasal (2 L/min)"
    }[form.respiratorio];

    const card = {
      normocardia: "hemodinamicamente estável, normocárdico e perfundido",
      tachycardia: "hemodinamicamente estável, registrando taquicardia em repouso",
      bradycardia: "estável, contudo com bradicardia sinusal leve",
      instable: "instabilidade hemodinâmica transitória com necessidade de monitoração contínua"
    }[form.cardiovascular];

    const geral = {
      stable: "estado geral preservado, corado e bem hidratado",
      dehydrated: "estado geral regular, com sinais de leve desidratação mucocutânea",
      pallid: "estado geral regular, hipocorado (+/4+), afebril",
      lesion: "geral estável, mas portador de lesão por pressão (LPP) sacral em processo de cicatrização"
    }[form.estado_geral];

    const disp = {
      none: "ausência de dispositivos invasivos",
      avp: "com Acesso Venoso Pérvio (AVP) periférico viável em membro superior",
      catheter: "portador de Cateter Venoso Central (CVC) limpo, fixado e pérvio",
      svd: "portador de Sonda Vesical de Demora (SVD) acoplada a coletor fechado com diurese clara",
      sne: "portador de Sonda Nasoenteral (SNE) posicionada para terapia nutricional"
    }[form.dispositivos];

    const caresList = [];
    if (form.hygiene) caresList.push("realizado banho de leito e higiene oral rigorosa");
    if (form.decubitus) caresList.push("providenciado mudança de decúbito no regime assistencial preventivo");
    if (form.medication) caresList.push("administradas medicações conforme prescrição médica e de horário");
    if (form.dressing) caresList.push("realizado curativo estéril compressivo no local lesionado");
    if (form.diuresis) caresList.push("realizada mensuração rigorosa do débito urinário");
    if (form.glycemia) caresList.push(`realizado controle de glicemia capilar (${hgtVal || "verificado"})`);
    if (form.diet) caresList.push("dieta hospitalar para patologia aceita com boa tolerância");
    if (form.mobility) caresList.push("estimulada deambulação precoce ativa e exercícios leves assistidos");

    const caresText = caresList.length > 0
      ? `Intervenções e cuidados efetuados: ${caresList.join(", ")}.`
      : "Seguido plano de cuidados padrão de enfermagem hospitalar de rotina.";

    const customObs = form.observations.trim()
      ? `Observações complementares do plantão: "${form.observations.trim()}"`
      : "Ausência de queixas, algias severas agudas ou intercorrências no período.";

    return `SISTEMATIZAÇÃO DA ASSISTÊNCIA DE ENFERMAGEM (SAE) - EVOLUÇÃO ASSISTENCIAL

Ao exame físico de enfermagem, o paciente apresenta-se ${neuro}, ${geral}. Padrão respiratório classificado como ${resp} com saturação periférica aferida de ${spo2}. Do ponto de vista circulatório, encontra-se ${card}, com frequência cardíaca de ${fc} e PA de ${pa}. Temperatura térmica axial identificada em ${t}. ${hgtVal ? `Aferição de ${hgtVal}.` : ""} Apresenta ${painScale}. Dispositivos: ${disp}.

${caresText}

${customObs}

Registro legal emitido em concordância com a Resolução COFEN nº 736/2023. Integralidade dos dados clínicos e logs imutáveis resguardados pela plataforma StellarCare.`;
  }, [form, selectedPatient]);

  const handleSignProgressMock = () => {
    if (isSigning || signed) return;
    setIsSigning(true);
    setSigningProgress(0);

    const intvl = setInterval(() => {
      setSigningProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intvl);
          const txUid = `blockchain_tx_0x9${Math.random().toString(36).substring(2, 10).toUpperCase()}f7`;
          const integrity = `SHA256: 0x${Math.abs(hashData()).toString(16).substring(0, 32)}9aef`;
          setTransactionId(txUid);
          setIntegrityHash(integrity);
          setSigned(true);
          setIsSigning(false);

          setTimeout(() => {
            onSign(selectedPatient.id, {
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              temp: parseFloat(form.temp) || 36.5,
              spo2: parseFloat(form.spo2) || 98,
              pain: parseFloat(form.pain) || 0,
              sys: parseFloat(form.pa_sys) || 120,
              dia: parseFloat(form.pa_dia) || 80,
              fc: parseFloat(form.fc) || 75,
              fr: parseFloat(form.fr) || 16,
            });
          }, 1500);

          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  const hashData = () => {
    const raw = `${form.temp}|${form.spo2}|${form.pain}|${form.pa_sys}|${form.fr}|RobertoSilva|${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto p-1 md:p-4 font-sans select-none pb-12">
      {/* Top Banner and Navigation Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4EAF4] pb-6">
        <div>
          <span className="text-[10px] bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--primary-mid)] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-block">
            MÓDULO ASSISTENCIAL DE PLANTAO
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--black)] mt-2 font-sans md:leading-tight">
            Formulário de Evolução de Enfermagem
          </h1>
          <p className="text-sm text-[var(--gray-500)] mt-1">
            Sistematização Inteligente da Assistência de Enfermagem (SAE) e Prontuário Jurídico
          </p>
        </div>

        {signed ? (
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-2xl text-xs font-bold tracking-wide flex items-center gap-2.5 border border-emerald-300 shadow-sm animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            EVOLUÇÃO PROTOCOLADA E REGISTRADA
          </div>
        ) : (
          <div className="flex items-center gap-2.5 bg-white border border-[#E4EAF4] p-2.5 rounded-2xl shadow-sm text-xs">
            <Clock className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-[var(--gray-500)]">Preenchimento Ativo:</span>
            <span className="font-bold text-[var(--black)] font-mono">PLANTÃO ATUAL</span>
          </div>
        )}
      </div>

      {/* Patient Profile Quick Card Selector */}
      <div className="bg-white border border-[#E4EAF4] rounded-3xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[var(--primary-light)] border border-[var(--primary-mid)] rounded-2xl flex items-center justify-center text-[var(--primary)] text-xl font-bold">
            <User className="w-6 h-6" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--gray-500)] mb-1">
              Paciente Selecionado
            </label>
            <select
              disabled={signed || isSigning}
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-transparent text-[var(--black)] font-extrabold text-lg leading-snug outline-none border-b border-dashed border-slate-300 pb-1 w-full md:w-auto hover:border-[var(--primary)] focus:border-[var(--primary)] transition-all cursor-pointer"
            >
              {patients.length === 0 ? (
                <option value="" className="bg-white">Nenhum Paciente</option>
              ) : null}
              {patients.map((p) => (
                <option key={p.id} value={p.id} className="bg-white text-[var(--black)]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedPatient && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-xs border-t md:border-t-0 md:border-l border-[#E4EAF4] pt-4 md:pt-0 md:pl-8">
            <div>
              <span className="text-[var(--gray-500)] block">Unidade/Leito</span>
              <span className="font-bold text-[var(--black)]">{selectedPatient.bed}</span>
            </div>
            <div>
              <span className="text-[var(--gray-500)] block">Idade</span>
              <span className="font-bold text-[var(--black)]">{selectedPatient.age} Anos</span>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="text-[var(--gray-500)] block">Diagnóstico Principal</span>
              <span className="font-bold text-[var(--black)] truncate max-w-[200px] block" title={selectedPatient.diagnosis}>
                {selectedPatient.diagnosis}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Clinical Presets Bar - Highly professional demonstration aid */}
      {!signed && !isSigning && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Selecione um Preset de Caso para Simulação Rápida:</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => applyPreset("estavel")}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span>💚 Estável / Rotina</span>
            </button>
            <button
              onClick={() => applyPreset("febril")}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:border-amber-500 hover:bg-amber-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span>🔥 Hipertermia / Febre</span>
            </button>
            <button
              onClick={() => applyPreset("hipoxia")}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:border-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span>🚨 Hipóxia / Crítico</span>
            </button>
            <button
              onClick={() => applyPreset("dor_pos_op")}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span>⚡ Dor Pós-Operatória</span>
            </button>
          </div>
        </div>
      )}

      {/* Stepper Wizard Indicator Progress */}
      <div className="grid grid-cols-3 gap-2 bg-white border border-[#E4EAF4] p-2.5 rounded-2xl shadow-sm text-center">
        {[
          { num: 1, label: "Parâmetros Clínicos", desc: "Sinais vitais e NEWS 2" },
          { num: 2, label: "Avaliação Sistêmica", desc: "Exame físico e Cuidados" },
          { num: 3, label: "Síntese e Blockchain", desc: "Minuta de evolução" },
        ].map((s) => {
          const isAct = step === s.num;
          const isPast = step > s.num;
          return (
            <button
              key={s.num}
              onClick={() => {
                if (!isSigning) setStep(s.num);
              }}
              className={`p-2.5 rounded-xl transition-all text-xs text-left flex items-center gap-3 cursor-pointer ${
                isAct
                  ? "bg-[var(--primary-light)] text-[var(--primary-hover)] border border-[var(--primary-mid)] font-bold shadow-sm"
                  : isPast
                  ? "bg-slate-50 text-slate-500 font-semibold"
                  : "text-slate-400 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  isAct
                    ? "bg-[var(--primary)] text-white"
                    : isPast
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isPast ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <div className="hidden sm:block">
                <span className="block leading-none">{s.label}</span>
                <span className="text-[9px] text-slate-400 font-normal block mt-0.5">{s.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Form Fields Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE STEP DETAILS */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-[#E4EAF4] rounded-3xl p-5 md:p-8 shadow-sm">
          
          {/* STEP 1: PARÂMETROS CLÍNICOS (VITALS & IMEDIATE CLASS VALS) */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[#E4EAF4] pb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[var(--primary)]" />
                  <h3 className="font-extrabold text-[var(--black)] text-base"> Sinais Vitais do Paciente </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Aferição no Leito</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Temperature Card */}
                <div className="p-4 bg-slate-50 border border-[#E4EAF4] rounded-2xl flex flex-col justify-between hover:border-[var(--primary-mid)] transition-all">
                  <div className="flex justify-between items-center text-xs mb-2.5">
                    <span className="text-[var(--gray-500)] font-bold flex items-center gap-1.5"><Thermometer className="w-4 h-4 text-orange-500" /> Temperatura</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${classifications.temp.color}`}>
                      {classifications.temp.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.1"
                      disabled={signed || isSigning}
                      value={form.temp}
                      onChange={(e) => setForm({ ...form, temp: e.target.value })}
                      className="text-xl font-bold bg-white border border-[#E4EAF4] rounded-xl px-3 py-2 w-full focus:ring-1 focus:ring-[var(--primary)] outline-none"
                    />
                    <span className="text-sm font-bold text-slate-500">°C</span>
                  </div>
                </div>

                {/* SpO2 Oxygen Card */}
                <div className="p-4 bg-slate-50 border border-[#E4EAF4] rounded-2xl flex flex-col justify-between hover:border-[var(--primary-mid)] transition-all">
                  <div className="flex justify-between items-center text-xs mb-2.5">
                    <span className="text-[var(--gray-500)] font-bold flex items-center gap-1.5"><Wind className="w-4 h-4 text-sky-500" /> Oxigênio (SpO2)</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${classifications.spo2.color}`}>
                      {classifications.spo2.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      disabled={signed || isSigning}
                      value={form.spo2}
                      onChange={(e) => setForm({ ...form, spo2: e.target.value })}
                      className="text-xl font-bold bg-white border border-[#E4EAF4] rounded-xl px-3 py-2 w-full focus:ring-1 focus:ring-[var(--primary)] outline-none"
                    />
                    <span className="text-sm font-bold text-slate-500">%</span>
                  </div>
                </div>

                {/* Blood Pressure Card */}
                <div className="p-4 bg-slate-50 border border-[#E4EAF4] rounded-2xl flex flex-col justify-between hover:border-[var(--primary-mid)] transition-all">
                  <div className="flex justify-between items-center text-xs mb-2.5">
                    <span className="text-[var(--gray-500)] font-bold flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-500" /> Pressão Arterial (S/D)</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${classifications.bp.color}`}>
                      {classifications.bp.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Sis"
                      disabled={signed || isSigning}
                      value={form.pa_sys}
                      onChange={(e) => setForm({ ...form, pa_sys: e.target.value })}
                      className="text-center font-bold bg-white border border-[#E4EAF4] rounded-xl px-3 py-2 w-full focus:ring-1 focus:ring-[var(--primary)] outline-none"
                    />
                    <span className="text-slate-400">/</span>
                    <input
                      type="number"
                      placeholder="Dia"
                      disabled={signed || isSigning}
                      value={form.pa_dia}
                      onChange={(e) => setForm({ ...form, pa_dia: e.target.value })}
                      className="text-center font-bold bg-white border border-[#E4EAF4] rounded-xl px-3 py-2 w-full focus:ring-1 focus:ring-[var(--primary)] outline-none"
                    />
                    <span className="text-xs font-bold text-slate-500">mmHg</span>
                  </div>
                </div>

                {/* Heart Rate FC Card */}
                <div className="p-4 bg-slate-50 border border-[#E4EAF4] rounded-2xl flex flex-col justify-between hover:border-[var(--primary-mid)] transition-all">
                  <div className="flex justify-between items-center text-xs mb-2.5">
                    <span className="text-[var(--gray-500)] font-bold flex items-center gap-1.5"><Activity className="w-4 h-4 text-red-500" /> Freq. Cardíaca (FC)</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${classifications.fc.color}`}>
                      {classifications.fc.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      disabled={signed || isSigning}
                      value={form.fc}
                      onChange={(e) => setForm({ ...form, fc: e.target.value })}
                      className="text-xl font-bold bg-white border border-[#E4EAF4] rounded-xl px-3 py-2 w-full focus:ring-1 focus:ring-[var(--primary)] outline-none"
                    />
                    <span className="text-sm font-bold text-slate-500">bpm</span>
                  </div>
                </div>

                {/* Respiratory Rate FR Card */}
                <div className="p-4 bg-slate-50 border border-[#E4EAF4] rounded-2xl flex flex-col justify-between hover:border-[var(--primary-mid)] transition-all">
                  <div className="flex justify-between items-center text-xs mb-2.5">
                    <span className="text-[var(--gray-500)] font-bold flex items-center gap-1.5"><Wind className="w-4 h-4 text-slate-500" /> Freq. Respiratória (FR)</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">
                      Padrão Adulto
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      disabled={signed || isSigning}
                      value={form.fr}
                      onChange={(e) => setForm({ ...form, fr: e.target.value })}
                      className="text-xl font-bold bg-white border border-[#E4EAF4] rounded-xl px-3 py-2 w-full focus:ring-1 focus:ring-[var(--primary)] outline-none"
                    />
                    <span className="text-sm font-bold text-slate-500">irpm</span>
                  </div>
                </div>

                {/* Subjetive Pain Scale Slider Card */}
                <div className="p-4 bg-slate-50 border border-[#E4EAF4] rounded-2xl flex flex-col justify-between hover:border-[var(--primary-mid)] transition-all">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-[var(--gray-500)] font-bold flex items-center gap-1.5">💥 Escala de Dor (Pain)</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${classifications.pain.color}`}>
                      {classifications.pain.text}
                    </span>
                  </div>
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center gap-3.5">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        disabled={signed || isSigning}
                        value={form.pain}
                        onChange={(e) => setForm({ ...form, pain: e.target.value })}
                        className="w-full accent-[var(--primary)] cursor-pointer h-1 rounded bg-slate-200"
                      />
                      <span className="text-xl font-extrabold text-[var(--black)] font-mono min-w-[20px] text-right">{form.pain}</span>
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-400 font-semibold font-sans">
                      <span>0. AUSENTE</span>
                      <span>5. MODERADA</span>
                      <span>10. INSUPORTÁVEL</span>
                    </div>
                  </div>
                </div>

                {/* HGT/Capillary Glycemia Card */}
                <div className="p-4 bg-slate-50 border border-[#E4EAF4] rounded-2xl flex flex-col justify-between hover:border-[var(--primary-mid)] transition-all md:col-span-2">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-[var(--gray-500)] font-bold flex items-center gap-1.5">🩸 Glicemia Capilar (HGT)</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">mg/dL</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      disabled={signed || isSigning}
                      value={form.hgt}
                      onChange={(e) => setForm({ ...form, hgt: e.target.value })}
                      className="text-lg font-bold bg-white border border-[#E4EAF4] border-slate-200 rounded-xl px-3 py-2 w-48 focus:ring-1 focus:ring-[var(--primary)] outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5 text-[9px] text-slate-500">
                      <span className={`px-2 py-1 rounded-full border ${parseInt(form.hgt) > 180 ? 'bg-amber-50 text-amber-700 border-amber-200' : parseInt(form.hgt) < 70 ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {parseInt(form.hgt) > 180 ? 'Hiperqueratose / Elevado' : parseInt(form.hgt) < 70 ? 'Hipoglicemia / Atenção' : 'Glicemia Estável'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* NEWS 2 Instant Display inside the step */}
              <div className={`p-4 border rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 ${news2ScoreInfo.border} bg-slate-50`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex flex-col justify-center items-center font-extrabold ${news2ScoreInfo.color} shadow-lg z-10`}>
                    <span className="text-xs leading-none text-white/80 font-medium">NEWS 2</span>
                    <span className="text-xl leading-tight font-extrabold">{news2ScoreInfo.score}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[var(--black)] leading-tight flex items-center gap-1.5">
                      Classificação Ativa: <span className="text-[var(--primary)]">{news2ScoreInfo.level}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-normal max-w-md">
                      {news2ScoreInfo.recommendation}
                    </p>
                  </div>
                </div>
                <div className="text-[9px] font-bold text-slate-400 tracking-wider text-right border-t md:border-t-0 md:border-l border-[#E4EAF4] pt-2 md:pt-0 md:pl-4 self-stretch flex flex-col justify-center">
                  <span>RESOLUÇÃO COFEN</span>
                  <span>736/2023 - SUPORTE</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: AVALIAÇÃO SISTÊMICA (PHYSICAL EXAM & INTERVENTIONS) */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[#E4EAF4] pb-4">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-[var(--primary)]" />
                  <h3 className="font-extrabold text-[var(--black)] text-base"> Exame Físico por Sistemas Orgânicos </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Avaliação Ativa</span>
              </div>

              {/* Radio Group Lists styled beautifully */}
              <div className="space-y-5">
                {/* 1. Neurológico */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2.5">Nível de Consciência (Neurológico)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: "lucid", label: "Consciente/Lúcido", color: "border-emerald-300 text-emerald-800 bg-emerald-50/10" },
                      { id: "confused", label: "Confuso/Agitado", color: "border-amber-300 text-amber-800 bg-amber-50/10" },
                      { id: "somnolent", label: "Sonolento", color: "border-sky-300 text-sky-800 bg-sky-50/10" },
                      { id: "comatose", label: "Rebaixado/Comatose", color: "border-rose-300 text-rose-800 bg-rose-50/10" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        disabled={signed || isSigning}
                        onClick={() => setForm({ ...form, neurologico: opt.id as any })}
                        className={`px-3.5 py-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          form.neurologico === opt.id
                            ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary-hover)] scale-[1.02] shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Respiratório */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2.5">Padrão Respiratório</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: "eupnea", label: "Eupneico (Livre)" },
                      { id: "dyspnea", label: "Dispneico (Esforço)" },
                      { id: "tachypnea", label: "Taquipneico" },
                      { id: "oxygen_support", label: "Suporte O2 Nasal" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        disabled={signed || isSigning}
                        onClick={() => setForm({ ...form, respiratorio: opt.id as any })}
                        className={`px-3.5 py-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          form.respiratorio === opt.id
                            ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary-hover)] scale-[1.02] shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Cardiovascular */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2.5">Hemodinâmica</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: "normocardia", label: "Normocárdico" },
                      { id: "tachycardia", label: "Taquicárdico" },
                      { id: "bradycardia", label: "Bradicárdico" },
                      { id: "instable", label: "Hemod. Instável" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        disabled={signed || isSigning}
                        onClick={() => setForm({ ...form, cardiovascular: opt.id as any })}
                        className={`px-3.5 py-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          form.cardiovascular === opt.id
                            ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary-hover)] scale-[1.02] shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Estado Geral */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2.5">Estado Geral & Nutrição</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: "stable", label: "Estável Preservado" },
                      { id: "dehydrated", label: "Sinal Desidratação" },
                      { id: "pallid", label: "Hipocorado/Pálido" },
                      { id: "lesion", label: "Lesão por Pressão" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        disabled={signed || isSigning}
                        onClick={() => setForm({ ...form, estado_geral: opt.id as any })}
                        className={`px-3.5 py-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          form.estado_geral === opt.id
                            ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary-hover)] scale-[1.02] shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Dispositivos e Linhas Invasivas */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2.5">Acessos & Dispositivos</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {[
                      { id: "none", label: "Nenhum" },
                      { id: "avp", label: "Acesso Perif. (AVP)" },
                      { id: "catheter", label: "Cateter Central(CVC)" },
                      { id: "svd", label: "Vesical SVD" },
                      { id: "sne", label: "Enteral SNE" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        disabled={signed || isSigning}
                        onClick={() => setForm({ ...form, dispositivos: opt.id as any })}
                        className={`px-3.5 py-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          form.dispositivos === opt.id
                            ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary-hover)] scale-[1.02] shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Checkbox Care Area with nice Icons */}
              <div className="border bg-slate-50 rounded-2xl p-5 space-y-4">
                <h4 className="font-bold text-[var(--black)] text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                  Intervenções e Cuidados Praticados nesta Visita
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {[
                    { id: "hygiene", label: "🧼 Higiene Corporal/Leito" },
                    { id: "decubitus", label: "🛏️ Mudança de Decúbito" },
                    { id: "medication", label: "💊 Prescrição / Horário" },
                    { id: "dressing", label: "🩹 Curativo Estéril" },
                    { id: "diuresis", label: "🧪 Controle de Débito/Diurese" },
                    { id: "glycemia", label: "📊 Verificação de Glicose" },
                    { id: "diet", label: "🥛 Alimentação Aceita/Dieta" },
                    { id: "mobility", label: "🏃‍♂️ Mobilidade/Deambulação" }
                  ].map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
                        (form as any)[item.id]
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900 font-bold"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      } ${signed || isSigning ? "opacity-60 cursor-default" : ""}`}
                    >
                      <input
                        type="checkbox"
                        disabled={signed || isSigning}
                        checked={(form as any)[item.id]}
                        onChange={(e) => setForm({ ...form, [item.id]: e.target.checked })}
                        className="w-4.5 h-4.5 text-[var(--primary)] rounded border-slate-300 bg-white focus:ring-[var(--primary)] shrink-0"
                      />
                      <span className="truncate">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SÍNTESE E BLOCKCHAIN (FINAL PROSE MEMO & ICP MANUAL ANNOTATIONS) */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[#E4EAF4] pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[var(--primary)]" />
                  <h3 className="font-extrabold text-[var(--black)] text-base"> Minuta de Evolução Estruturada (SAE) </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Visualização Legal</span>
              </div>

              {/* Dynamic live compiled narrative review panel */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[var(--primary)] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping"></span>
                    Texto Clínico Consolidado StellarCare
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold font-mono">ICP-BRASIL REQUISITO</span>
                </div>
                <p className="text-xs text-slate-700 font-sans leading-relaxed whitespace-pre-wrap select-text bg-white p-4 border border-slate-200 rounded-xl">
                  {computedEvolutionProse}
                </p>
              </div>

              {/* Additional custom text field */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">Anotações Livres Complementares (Opcional)</label>
                <textarea
                  disabled={signed || isSigning}
                  value={form.observations}
                  onChange={(e) => setForm({ ...form, observations: e.target.value })}
                  placeholder="Se necessário, digite aqui observações adicionais como queixas subjetivas personalizadas, intercorrências do leito, exames laboratoriais novos, etc..."
                  className="w-full bg-[var(--gray-100)] border border-[#E4EAF4] rounded-2xl p-4 text-slate-800 focus:bg-white outline-none min-h-[90px] text-xs transition-all placeholder-slate-400"
                />
              </div>

              {/* Normative legal stamp */}
              <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" />
                <div className="text-[11px] text-sky-800 leading-normal">
                  <strong className="font-bold">Evolução Sistematizada Amparada por Lei:</strong> A elaboração deste registro observa a Resolução COFEN nº 736/2023, que institui a SAE em todo território nacional, protegendo a segurança jurídica do profissional e o acompanhamento integral do leito.
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Actions Bar */}
          <div className="flex items-center justify-between border-t border-[#E4EAF4] pt-6 mt-8">
            <button
              disabled={step === 1 || isSigning}
              onClick={() => setStep((p) => p - 1)}
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep((p) => p + 1)}
                className="px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-[var(--primary)]/10"
              >
                Avançar
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : signed ? (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Concluído
              </div>
            ) : (
              <button
                disabled={isSigning}
                onClick={handleSignProgressMock}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10 disabled:opacity-50"
              >
                {isSigning ? (
                  <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4.5 h-4.5 text-emerald-100" />
                )}
                {isSigning ? `Confirmando dados (${signingProgress}%)` : "Assinar Digitalmente e Registrar"}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: REALTIME ADVISORY COMPLIANCE SIDEBAR */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Active Warnings Shield Panel */}
          <div className="bg-white border border-[#E4EAF4] rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono pb-2 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-[var(--primary)]" />
              Triagem Ativa de Alertas
            </h4>

            {/* Quick parameter diagnostic badges list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-2 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="font-semibold text-slate-600">Temperatura Axilar</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${classifications.temp.color}`}>{parseFloat(form.temp) || 36.5}°C</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="font-semibold text-slate-600">Saturação Sangue (SpO2)</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${classifications.spo2.color}`}>{parseFloat(form.spo2) || 98}%</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="font-semibold text-slate-600">Pressão Arterial</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${classifications.bp.color}`}>{form.pa_sys}/{form.pa_dia}</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="font-semibold text-slate-600">Fr. Cardíaca (FC)</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${classifications.fc.color}`}>{form.fc} bpm</span>
              </div>
            </div>

            {/* Dynamic Alarm Block when alerts exist */}
            {(parseFloat(form.temp) >= 38.0 || parseFloat(form.spo2) < 93 || parseInt(form.pain) >= 8) ? (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex flex-col gap-2 animate-pulse">
                <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  AGRAVANTE CLÍNICO IDENTIFICADO
                </div>
                <p className="text-[11px] text-rose-700 leading-normal leading-relaxed">
                  {parseFloat(form.spo2) < 93 ? "Saturação de oxigênio abaixo do aceitável (<93%). Recomenda-se elevar leito Fowler e acionar equipe de plantão urgência." : ""}
                  {parseFloat(form.temp) >= 38.0 ? " Febre/Hipertermia sustentada. Recomenda-se resfriamento físico passivo e monitoração da prescrição médica antipirética." : ""}
                  {parseInt(form.pain) >= 8 ? " Queixa de algialdor com escala aguda severe (>=8/10). Recomenda-se providenciar alívio SOS e decúbito de conforto imediato." : ""}
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                Parâmetros gerais do paciente estáveis sob vigilância assistencial.
              </div>
            )}
          </div>

          {/* ICP-Brasil/COFEN Blockchain anchor panel */}
          <div className="bg-white border border-[#E4EAF4] rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono pb-2 border-b border-slate-100 flex items-center gap-2">
              <Lock className="w-4.5 h-4.5 text-emerald-600" />
              Assinatura e Segurança COFEN
            </h4>

            {signed && transactionId && integrityHash ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                  <div className="text-[10.5px] font-extrabold text-emerald-800 uppercase tracking-wide leading-tight">
                    INTEGRIDADE ASSEGURADA
                  </div>
                </div>

                {/* Pure CSS Styled QR Code which represents typical professional medical blockchain credentials */}
                <div className="flex items-center gap-4 bg-slate-50 p-3.5 border rounded-xl">
                  {/* CSS QR CODE */}
                  <div className="w-16 h-16 bg-white border border-slate-200 p-1 rounded-sm grid grid-cols-4 gap-0.5 shrink-0 select-none">
                    <div className="bg-slate-900 rounded-xs"></div><div className="bg-slate-900 rounded-xs"></div><div className="bg-white"></div><div className="bg-slate-900 rounded-xs"></div>
                    <div className="bg-slate-900 rounded-xs"></div><div className="bg-white"></div><div className="bg-slate-900 rounded-xs"></div><div className="bg-slate-900 rounded-xs"></div>
                    <div className="bg-white"></div><div className="bg-slate-900 rounded-xs"></div><div className="bg-slate-900 rounded-xs"></div><div className="bg-white"></div>
                    <div className="bg-slate-900 rounded-xs"></div><div className="bg-white"></div><div className="bg-slate-900 rounded-xs"></div><div className="bg-slate-900 rounded-xs"></div>
                  </div>
                  <div className="text-[9px] text-slate-400 space-y-1 font-mono">
                    <div className="text-slate-700 font-bold">QR VERIFIER DIGITAL</div>
                    <div>COFEN REG: SP-214.992</div>
                    <div>AUDIT: SUITE-V1.2</div>
                  </div>
                </div>

                <div className="text-[10px] space-y-2 border-t border-[#E4EAF4] pt-3 text-slate-500">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase">Hash de Integridade</span>
                    <span className="block font-mono text-[9px] text-sky-700 truncate select-all">{integrityHash}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase">Assinatura Certificada</span>
                    <span className="block font-mono text-[9px] text-sky-700 truncate select-all">{transactionId}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 italic">
                    Este documento não poderá ser cancelado, deletado ou editado retroativamente por imposição das regras ICP-Brasil.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 leading-normal space-y-3.5">
                <p>
                  Cada evolução registrada gera um comprovante digital seguro com criptografia SHA256 simulada pela segurança ICP-Brasil.
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-[9px] text-slate-400">
                  <div>PROFISSIONAL COREN ATIVO</div>
                  <div>LEITO: {selectedPatient?.bed || "--"}</div>
                  <div className="text-emerald-600 font-bold flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping inline-block"></span>
                    PRONTO PARA CRIPTOGRAFAR
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
