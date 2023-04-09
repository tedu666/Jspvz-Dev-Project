// lca +  ˜…œæ‡¿ÎÃ‚
// CF1304E: 1-Trees and Queries

#include<bits/stdc++.h>
#define coin const int
#define lll (long long)
#define ll long long
#define ull unsigned long long
#define function(...) [](__VA_ARGS__)

const ll N = 200000 + 10;
const int inf = 1000000000;
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

struct Node{
	int v, w;
};

int fa[N][32], dep[N], dis[N], u, v, w;

vector<Node> G[N];

void dfs(int u, int f) {
	fa[u][0] = f, dep[u] = dep[f] + 1;
	for (auto v: G[u]) if (v.v != f) dis[v.v] = dis[u] + v.w, dfs(v.v, u);
}

void init(int n) {
	for (int i = 1; i <= 20; ++i) {
		for (int j = 1; j <= n; ++j) {
			fa[j][i] = fa[fa[j][i-1]][i-1];
		}
	}
}

int lca(int u, int v) {
	if (dep[u] > dep[v]) swap(u, v);
	
	int k = dep[v] - dep[u];
	for (int i = 20; i >= 0; --i) if (k >= (1 << i)) v = fa[v][i], k -= (1<<i);

	if (u == v) return u;

	for (int i = 20; i >= 0; --i) if (fa[u][i] != fa[v][i]) u = fa[u][i], v = fa[v][i];

	u = fa[u][0];
	return u;
}

int n, m;
int get (int a, int b) { return (a % 2) == (b % 2) && a <= b; }
int calc (int u, int v) { return dis[u] + dis[v] - 2 * (dis[lca(u, v)]); }
int x, y, a, b, k;

int main() {
	n = read();
	for (int i = 1; i < n; i++) {
		u = read(), v = read(), w = 1;
		G[u].push_back(Node{v, w});
		G[v].push_back(Node{u, w});
	}
	dfs(1, 0), init(n);

	m = read();
	for (int i = 1; i <= m; ++i) {
		x = read(), y = read(), a = read(), b = read(), k = read();
		int A = calc(a, b), B = calc(a, x) + 1 + calc(y, b), C = calc(a, y) + 1 + calc(x, b);
		cout << ((get(A, k) | get(B, k) | get(C, k)) ? "YES" : "NO") << endl; 
	}
	return 0;
}
