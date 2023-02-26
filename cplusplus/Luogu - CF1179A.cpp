// Title: Valeriy and Deque

#include<bits/stdc++.h>
#define coin const int
#define lll (long long)
#define ll long long
#define ull unsigned long long

const int N = 200000 + 10;
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

ll n,q,x,maxnum;
ll que[N],newque[N];
ll curmax[N],nowarray = 0,maxstart=0;

int main() {
	n=read(),q=read();
	for(int i=1;i<=n;i++){
		que[i]=read();
		curmax[i]=max(curmax[i-1],que[i]);
		if(i-1 == 0) continue;
		
		if(curmax[i] != curmax[i-1]){
			newque[nowarray++]=curmax[i-1];
			maxstart=i-1;
		}else{ 
			newque[nowarray++]=que[i];
		}
	}
	while(q--){
		x=read();
		if(x <= maxstart){
			printf("%lld %lld\n",curmax[x],que[x+1]);
		}else{
			printf("%lld %lld\n",curmax[n],newque[(x+nowarray-1)%nowarray]);
		}
	}
	return 0;
}
