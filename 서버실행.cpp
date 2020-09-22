#include<stdlib.h>
int main(){
	char aa[250]="node main.js";
	char bb[250]="cd \"C:\\Program Files\\Mozilla Firefox\" && firefox.exe localhost:80";
	
	system(bb);
	system(aa);
}
