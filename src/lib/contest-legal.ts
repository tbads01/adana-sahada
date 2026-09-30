import type { ContestLegalDoc } from "./contest";

export const DEFAULT_LEGAL: ContestLegalDoc = {
  version: "2026-09-30-2",
  updatedAt: "2026-09-30T10:00:00+03:00",
  kvkk: {
    tr: `ADANA OPEN TAHMİN YARIŞMASI
KVKK AYDINLATMA METNİ
(Taslak — yayına alınmadan önce hukuk danışmanı kontrolüne açıktır.)

Veri sorumlusu: Adana Tenis, Dağ ve Su Sporları Kulübü (ATDSK) / Adana Open organizasyonu.
İletişim: info@adanaopen.com · +90 322 234 11 55

Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında “Adana Open Tahmin Yarışması”na katılımınız nedeniyle işlenen kişisel verileriniz hakkında sizi bilgilendirmek için hazırlanmıştır.

İşlenen veriler: ad, soyad, cep telefonu numarası, üç tahmin cevabı, verdiğiniz onayların tarihi ve kabul edilen metin sürümü, katılımın Türkiye saatiyle kaydı. Ticari ileti onayı verirseniz bu tercih de saklanır.

Amaç: yarışma katılımının alınması, tahminlerin değerlendirilmesi, çekilişin yürütülmesi, kazananlarla iletişim, yasal yükümlülüklerin yerine getirilmesi ve gerektiğinde itirazların incelenmesi.

Hukuki sebepler: Kanunun 5. maddesi uyarınca açık rıza; bir hakkın tesisi, kullanılması veya korunması; veri sorumlusunun meşru menfaati (organizasyonun yürütülmesi) — her biri ilgili işlem için ayrı ayrı değerlendirilir.

Aktarım: veriler, yalnızca yarışmanın işletilmesi için zorunlu teknik hizmet sağlayıcılarına (barındırma) ve hukuken yetkili mercilere aktarılabilir. Yurt dışına aktarım öngörülmemektedir.

Saklama: katılım kayıtları, sonuçların açıklanmasından itibaren en geç bir yıl içinde silinir veya anonimleştirilir; daha uzun saklama yalnızca yasal zorunluluk halinde uygulanır.

Haklarınız: Kanunun 11. maddesi uyarınca verilerinize erişme, düzeltme, silme, işlemeyi kısıtlama ve itiraz etme haklarına sahipsiniz. Başvurularınızı info@adanaopen.com adresine iletebilirsiniz.`,
    en: `ADANA OPEN PREDICTION CONTEST
PRIVACY NOTICE
(Draft — to be reviewed by legal counsel before publication.)

Controller: Adana Tennis, Mountaineering and Water Sports Club (ATDSK) / Adana Open organisation.
Contact: info@adanaopen.com · +90 322 234 11 55

This notice explains how personal data is processed when you enter the Adana Open Prediction Contest, under Turkish Law No. 6698.

Data: first name, last name, mobile number, three predictions, the time and version of each consent, and the entry timestamp in Turkey time. A marketing preference is stored only if you opt in.

Purpose: receiving entries, scoring predictions, running the raffle, contacting winners, meeting legal duties and reviewing objections.

Legal bases include consent, the establishment or protection of a right, and legitimate interests in running the event, each applied to the relevant processing.

Transfers: only to hosting providers needed to run the contest and to competent authorities. No transfer abroad is intended.

Retention: records are deleted or anonymised within one year of the results being announced, unless a longer period is required by law.

You may request access, correction, deletion or restriction at info@adanaopen.com.`,
  },
  riza: {
    tr: `ADANA OPEN TAHMİN YARIŞMASI
AÇIK RIZA METNİ
(Taslak — yayına alınmadan önce hukuk danışmanı kontrolüne açıktır.)

Adana Open Tahmin Yarışması’na katılmak için ad, soyad, cep telefonu numaram ve tahminlerimin; katılımın alınması, değerlendirilmesi, çekilişin yapılması ve kazananlarla iletişim kurulması amaçlarıyla işlenmesine, KVKK Aydınlatma Metni’nde belirtilen esaslar çerçevesinde açık rıza veriyorum.

Bu rıza yarışmaya katılım için gereklidir. Rızamı info@adanaopen.com adresine başvurarak geri alabilirim; rızanın geri alınması, rıza tarihinden önceki hukuka uygun işlemleri etkilemez.`,
    en: `ADANA OPEN PREDICTION CONTEST
EXPLICIT CONSENT
(Draft — to be reviewed by legal counsel before publication.)

I consent to the processing of my first name, last name, mobile number and predictions in order to receive my entry, score the contest, run the raffle and contact winners, as described in the privacy notice.

This consent is required to enter. I may withdraw it by writing to info@adanaopen.com; withdrawal does not affect processing that was lawful before that date.`,
  },
  rules: {
    tr: `ADANA OPEN TAHMİN YARIŞMASI
KATILIM KOŞULLARI VE ÇEKİLİŞ KURALLARI
(Taslak — yayına alınmadan önce hukuk danışmanı kontrolüne açıktır.)

1. Organizatör: Adana Open / ATDSK.
2. Katılım: 4 Ekim 2026 saat 10.00’a (Türkiye saati) kadar, formdaki zorunlu alanlar ve onaylar tamamlanarak yapılır. Bu saatten sonra başvuru alınmaz.
3. Kimler katılabilir: 18 yaşını doldurmuş gerçek kişiler. Aynı cep telefonu ile yalnızca bir katılım geçerlidir.
4. Tahminler: (i) turnuva boyunca toplam ace sayısı, (ii) tamamlanan tüm maçların resmî sürelerinin toplamı (dakika), (iii) final maçının resmî süresi (dakika). Yalnızca pozitif tam sayı kabul edilir.
5. Değerlendirme: Her soru ayrı puanlanır. Resmî sonuç açıklandığında, o sorudaki doğru değere mutlak farkı en küçük olan tahmin(ler) “en yakın” kabul edilir. Eşit en yakın tahminler o soruda birlikte başarılı sayılır.
6. Çekiliş havuzu: En az bir soruda en yakın tahmini yapan katılımcılar çekilişe girer. Birden fazla soruda başarılı olmak ek hak vermez; her katılımcı havuzda bir kez yer alır.
7. Çekiliş: Havuzdaki isimler arasından kura ile kazanan(lar) belirlenir. Eşit puan veya eşit yakınlık durumunda da aynı kura yöntemi uygulanır.
8. Ödül: Çekilişle toplam 20 kişiye sürpriz hediye verilir. Ödüller değişkenlik gösterebilir; belirli bir ürün, marka veya tutar taahhüt edilmez. Kazananlarla formda bildirilen cep telefonu üzerinden iletişime geçilir. Makul sürede ulaşılamayan kazanan yerine kura ile yedek belirlenebilir.
9. Resmî sonuçlar: Turnuva ve WTA kayıtlarındaki ace, maç süresi ve final süresi esas alınır.
10. Organizatör, teknik arıza, mükerrer kayıt veya kural ihlali halinde ilgili katılımı geçersiz sayabilir.
11. Kişisel veriler KVKK Aydınlatma Metni’ne göre işlenir.

İletişim: info@adanaopen.com · +90 322 234 11 55 · Instagram @adana.open`,
    en: `ADANA OPEN PREDICTION CONTEST
ENTRY TERMS AND RAFFLE RULES
(Draft — to be reviewed by legal counsel before publication.)

1. Organiser: Adana Open / ATDSK.
2. Deadline: 4 October 2026 at 10:00 Turkey time. No entry is accepted after that time.
3. Eligibility: natural persons aged 18 or over. One entry per mobile number.
4. Predictions: (i) total aces in the tournament, (ii) combined official duration of all completed matches in minutes, (iii) official duration of the final in minutes. Positive whole numbers only.
5. Scoring: each question is judged separately. The guess(es) with the smallest absolute difference from the official figure are the closest. Tied closest guesses all count.
6. Raffle pool: anyone closest on at least one question enters the raffle once.
7. Draw: winners are drawn by lot from the pool. The same method applies in case of ties.
8. Prize: surprise gifts for 20 people drawn from the pool. Prizes may vary; no specific item, brand or value is promised. Winners are contacted on the mobile number given on the form. A reserve may be drawn if a winner cannot be reached in reasonable time.
9. Official figures: WTA / tournament records of aces and match durations.
10. Duplicate or abusive entries may be voided.
11. Personal data is processed under the privacy notice.

Contact: info@adanaopen.com · +90 322 234 11 55 · Instagram @adana.open`,
  },
  draw: {
    tr: `ÇEKİLİŞ KURALLARI
(Taslak — yayına alınmadan önce hukuk danışmanı kontrolüne açıktır.)

Çekiliş, “Katılım Koşulları”ndaki değerlendirme yöntemine göre oluşan havuz üzerinden yapılır. Kura ile toplam 20 kişi belirlenir. Ödüller sürpriz hediyedir ve değişkenlik gösterebilir. Kura organizatör tarafından kayıt altına alınır. Kazananlara formdaki telefon numarasından ulaşılır. Sonuçlar Adana Open final gününde duyurulur.`,
    en: `RAFFLE RULES
(Draft — to be reviewed by legal counsel before publication.)

The raffle is drawn from the pool created under the entry terms. Twenty people are selected by lot. Gifts are a surprise and may vary. The draw is recorded by the organiser. Winners are contacted on the number given on the form. Results are announced on the Adana Open final day.`,
  },
  retention: {
    tr: "Katılım kayıtları, sonuçların açıklanmasından itibaren en geç bir yıl içinde silinir veya anonimleştirilir. Daha uzun saklama yalnızca yasal zorunluluk halinde uygulanır. (Taslak — hukuk danışmanı kontrolüne açıktır.)",
    en: "Entry records are deleted or anonymised within one year of the results being announced, unless a longer period is required by law. (Draft — for legal review.)",
  },
  marketing: {
    tr: `TİCARİ İLETİ ONAYI
(Taslak — yayına alınmadan önce hukuk danışmanı kontrolüne açıktır.)

İşaretlemeniz halinde Adana Open / ATDSK, kampanya, etkinlik ve duyurular hakkında sizi formda bildirdiğiniz cep telefonu üzerinden arama veya SMS ile bilgilendirebilir. Bu onay yarışmaya katılım için zorunlu değildir. İstediğiniz zaman info@adanaopen.com adresine yazarak veya iletide belirtilen şekilde vazgeçebilirsiniz.`,
    en: `MARKETING CONSENT
(Draft — to be reviewed by legal counsel before publication.)

If you opt in, Adana Open / ATDSK may contact you by call or SMS about campaigns, events and news on the mobile number you provide. This is not required to enter the contest. You may withdraw at any time via info@adanaopen.com.`,
  },
};
