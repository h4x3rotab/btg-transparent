<template>
  <div class="container">
    <div class="section">
      <div class="level">
        <div class="level-left">
          <div>
            <h1 class="title">{{ $t("title") }}</h1>
            <p class="subtitle">
              {{ $t("subtitle") }}
            </p>
            <p class="details">
              {{ $t("details")
              }}<a href="https://bitcoingold.org/endowment-wallets/">{{
                $t("linktext")
              }}</a>
            </p>
          </div>
        </div>
        <div class="level-right" style="margin-top: auto">
          <span><a href="#" @click.prevent="$i18n.locale = 'en'">🇺🇸·</a></span>
          <span><a href="#" @click.prevent="$i18n.locale = 'ar'">🇸🇦·</a></span>
          <span><a href="#" @click.prevent="$i18n.locale = 'pl'">🇵🇱·</a></span>
          <span><a href="#" @click.prevent="$i18n.locale = 'cn'">🇨🇳</a></span>
        </div>
      </div>
      <hr />
    </div>

    <div class="hero">
      <div class="level">
        <div class="level-item has-text-centered">
          <div>
            <div class="is-size-4">{{ $t("total") }}</div>
            <div class="is-size-3">
              {{ totalBalance >= 0 ? sattobtg(totalBalance) : $t("loading") }}
            </div>
          </div>
        </div>
      </div>
      <div class="level">
        <div class="level-item has-text-centered">
          <div>
            <div class="is-size-4">{{ $t("total_unlocked") }}</div>
            <div class="is-size-3">
              {{
                totalUnlockedBalance >= 0
                  ? sattobtg(totalUnlockedBalance)
                  : $t("loading")
              }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div
        class="level is-family-monospace"
        v-for="w in wallets"
        v-bind:key="w.addr"
      >
        <div class="level-left">
          <a
            :href="'https://explorer.bitcoingold.org/insight/address/' + w.addr"
            >{{ w.addr }}</a
          >
        </div>
        <div class="level-right">
          <span>{{ chaintip > 0 && chaintip >= w.cltv ? "" : "🔒" }}</span>
          <span>{{ w.balance != null ? sattobtg(w.balance) : "-" }}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="level">
        <div class="level-item has-text-centered">
          <div>
            <p>{{ $t("more_tools") }}</p>
            <p>
              2019 - <a href="https://github.com/h4x3rotab">h4x3rotab</a> @
              Bitcoin Gold
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import endowments from "./endowment";
import pThrottle from 'p-throttle';

const throttle = pThrottle({
	limit: 10,
	interval: 1000
});

const EXP_CHAIN = "https://explorer.bitcoingold.org/insight-api/blocks";
const EXP_BALANCE =
  "https://explorer.bitcoingold.org/insight-api/addr/{addr}/balance";
const EXP_UNCONF_BALANCE =
  "https://explorer.bitcoingold.org/insight-api/addr/{addr}/unconfirmedBalance";

export default {
  name: "MainApp",
  data: function () {
    return {
      wallets: endowments.map(([w, cltv, enabled]) => {
        return { addr: w, balance: null, cltv: cltv, enabled };
      }),
      totalBalance: -1,
      totalUnlockedBalance: -1,
      chaintip: -1,
    };
  },
  methods: {
    sattobtg(sat, prec) {
      prec = prec || 4;
      return (sat / 1e8).toFixed(prec) + " BTG";
    },
    async getblocktip() {
      const result = await this.$http.get(EXP_CHAIN);
      const obj = await result.json();
      this.chaintip = obj.blocks[0].height;
    },
    async getbalance(w) {
      if (w.enabled) {
        const resultConf = await this.$http.get(
          EXP_BALANCE.replace("{addr}", w.addr)
        );
        const resultUnconf = await this.$http.get(
          EXP_UNCONF_BALANCE.replace("{addr}", w.addr)
        );
        w.balance = parseInt(resultConf.body) + parseInt(resultUnconf.body);
      } else {
        w.balance = 0;
      }
    },
    async fetchall() {
      // (() => 0)
      await throttle(async () => this.getblocktip())()
      const downloadActions = [
        async () => this.getblocktip(),
        ...this.wallets.map(w => (async () => this.getbalance(w)))
      ];
      await Promise.all(
        downloadActions.map(a => throttle(a)())
      );
      this.onbalanceready();
    },
    onbalanceready() {
      let sum = 0;
      let unlockedSum = 0;
      this.wallets.forEach((w) => {
        sum += w.balance;
        if (this.chaintip >= w.cltv) {
          unlockedSum += w.balance;
        }
      });
      this.totalBalance = sum;
      this.totalUnlockedBalance = unlockedSum;
    },
  },
  mounted() {
    this.fetchall();
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
