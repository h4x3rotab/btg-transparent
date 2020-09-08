// throttlep :: Number -> [(* -> Promise)]
const throttlep = n=> Ps=>
  new Promise ((pass, fail)=> {
    // r is the number of promises, xs is final resolved value
    let r = Ps.length, xs = []
    // decrement r, save the resolved value in position i, run the next promise
    let next = i=> x=> (r--, xs[i] = x, run(Ps[n], n++))
    // if r is 0, we can resolve the final value xs, otherwise chain next
    let run = (P,i)=> r === 0 ? pass(xs) : P().then(next(i), fail)
    // initialize by running the first n promises
    Ps.slice(0,n).forEach(run)
  })

function getLanguage() {
  switch (navigator.language) {
    case 'zh-TW':
      return 'cn'
    case 'zh-CN':
      return 'cn'
    case 'ar':
      return 'ar'
	case 'pl':
	  return 'pl'
    default:
      return 'en'
  }
}

const i18n = new VueI18n({
  locale: getLanguage(),
  fallbackLocale: 'en',
  messages: translations,
})

EXP_CHAIN = 'https://explorer.bitcoingold.org/insight-api/blocks';
EXP_BALANCE = 'https://explorer.bitcoingold.org/insight-api/addr/{addr}/balance';

// Create a Vue instance with `i18n` option
new Vue({
  i18n,
  data: {
    wallets: endowments.map(([w, cltv]) => {return {addr: w, balance: null, cltv: cltv}}),
    totalBalance: -1,
    totalUnlockedBalance: -1,
    chaintip: -1,
  },
  methods: {
    sattobtg(sat, prec) {
      prec = prec || 4
      return (sat / 1e8).toFixed(prec) + ' BTG';
    },
    async getblocktip() {
      const result = await this.$http.get(EXP_CHAIN);
      const obj = await result.json();
      this.chaintip = obj.blocks[0].height;
    },
    async getbalance(w) {
      const result = await this.$http.get(EXP_BALANCE.replace('{addr}', w.addr));
      w.balance = parseInt(result.body);
    },
    async fetchall() {
      const downloadActions = [(() => this.getblocktip())]
        .concat(this.wallets.map(w => (() => this.getbalance(w))));
      await throttlep(10)(downloadActions)
      this.onbalanceready();
    },
    onbalanceready() {
      let sum = 0;
      let unlockedSum = 0;
      this.wallets.forEach(w => {
        sum += w.balance;
        if (this.chaintip >= w.cltv) {
          unlockedSum += w.balance;
        }
      });
      this.totalBalance = sum;
      this.totalUnlockedBalance = unlockedSum;
    }
  },
  mounted() {
    this.fetchall();
  }
}).$mount('#app')
