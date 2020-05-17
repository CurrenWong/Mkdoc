#include <bits/stdc++.h>
using namespace std;
const int N = 1e6 + 10;
int t, n, k;
int pre[N], f[N], g[N];
char s[N];
int main()
{
    int i, ans, x;
    scanf("%d", &t);
    while (t--) {
        scanf("%d%d", &n, &k);
        scanf("%s", s);
        for (i = 0; i < n; i++)
            pre[i + 1] = pre[i] + s[i] - '0';
        if (pre[n] == 0) {
            printf("0\n");
            continue;
        }
        for (i = 1; i <= n; i++) {
            f[i] = pre[i - 1];
            if (i - k > 0)
                f[i] = min(f[i], f[i - k] + pre[i - 1] - pre[i - k - 1]);
            if (s[i - 1] == '0')
                f[i]++;
        }
        for (i = n; i >= 1; i--) {
            g[i] = pre[n] - pre[i];
            if (i + k <= n)
                g[i] = min(g[i], g[i + k] + pre[i + k - 1] - pre[i]);
            if (s[i - 1] == '0')
                g[i]++;
        }
        //  cout<<f[6]<<' '<<g[6]<<endl;
        ans = n + 1;
        for (i = 1; i <= n; i++) {
            x = f[i] + g[i];
            if (s[i - 1] == '0')
                x--;
            if (x < ans)
                ans = x;
        }
        printf("%d\n", ans);
    }
    return 0;
}
