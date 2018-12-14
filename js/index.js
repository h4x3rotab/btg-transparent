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
    default:
      return 'en'
  }
}

const i18n = new VueI18n({
  locale: getLanguage(),
  fallbackLocale: 'en',
  messages: translations,
})

EXP_BALANCE = 'https://explorer.bitcoingold.org/insight-api/addr/{addr}/balance';

// Create a Vue instance with `i18n` option
new Vue({
  i18n,
  data: {
    wallets: endowments.map(w => {return {addr: w, balance: null}}),
    totalBalance: -1,
  },
  methods: {
    sattobtg(sat, prec) {
      prec = prec || 4
      return (sat / 1e8).toFixed(prec) + ' BTG';
    },
    getbalance(w) {
      return this.$http.get(EXP_BALANCE.replace('{addr}', w.addr)).then(result => {
        w.balance = parseInt(result.body);
      });
    },
    fetchall() {
      const downloadActions = this.wallets.map(w => () => this.getbalance(w));
      throttlep(10)(downloadActions).then(this.onbalanceready);
    },
    onbalanceready() {
      let sum = 0;
      this.wallets.forEach(w => {
        sum += w.balance;
      });
      this.totalBalance = sum;
    }
  },
  mounted() {
    this.fetchall();
  }
}).$mount('#app')
