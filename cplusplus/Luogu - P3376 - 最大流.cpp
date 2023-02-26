#include<bits/stdc++.h>
#define coin const int
#define lll (long long)
#define ll long long
#define ull unsigned ll
#define int ll

const int N = 500 + 10;
const int inf = 1e9;
using namespace std;

inline ll read() {
	ll x=0,k=1;
	char c=getchar();
	while(c<'0'||c>'9') {
		if(c=='-')k=-1;
		c=getchar();
	}
	while(c>='0'&&c<='9')x=(x<<3)+(x<<1)+(c^48),c=getchar();
	return (1ll*x*k);
}

int ind[N][N];
int cap[N][N], flow[N][N], a[N], p[N];

int solve(int n, int m, int S, int T, int f = 0) {
	memset(cap, 0, sizeof(cap));
	memset(flow, 0, sizeof(flow));

	for(int k = 0; k < m; k++) { // read in g
		int i = read(), j = read(), temp = read();
		cap[i][j] += temp;
	}

	queue<int> q;

	while (true) {
		memset(a, 0, sizeof(a)); // a[u] 代表的是到达 u 的流量
		a[S] = inf, q.push(S);
		while (!q.empty()) {
			int u = q.front();
			q.pop();
			for (int v = 1; v <= n; v++) {
				if (!a[v] && cap[u][v] > flow[u][v]) {
					p[v] = u; // p[v] 记录路径，代表的是到达 v 的上一个节点
					q.push(v);
					a[v] = min(a[u], cap[u][v] - flow[u][v]);
				}
			}
		}
		if(a[T] == 0) break;
		for(int u = T; u != S; u = p[u]) {
			flow[p[u]][u] += a[T];
			flow[u][p[u]] -= a[T];
		}
		f += a[T];
	}
	return f;
}

int n, m, s, t;

signed main() {
	n = read(), m = read(), s = read(), t = read();

	cout << solve(n, m, s, t) << endl;

	return 0;
}
