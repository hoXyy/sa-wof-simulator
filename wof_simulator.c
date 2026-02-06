#include <stdio.h>

static int playerCash = -1001; // starting debt
static int casinoCredit = 1000; // debt limit depending on gambling skill
static int maxWager = 100; // depends in which table you select
static int bets[6] = {0, 0, 0, 0, 0, 0};

static void clampCash(void) {
	if (playerCash > 999999999) {
		playerCash = 999999999;
	}
}

static int totalWager(void) {
	int total = 0;
	for (int i = 0; i < 6; i++) {
		total += bets[i];
	}
	return total;
}

static int getMagnitude(int value) {
	if (value <= 100) {
		return 1;
	}
	if (value <= 1000) {
		return 10;
	}
	if (value <= 10000) {
		return 100;
	}
	if (value <= 100000) {
		return 1000;
	}
	return 10000;
}

static int increaseWager(int bet) {
	int stepSize = getMagnitude(bets[bet]);
	int brokenStep = playerCash + casinoCredit;
	if (stepSize > brokenStep) {
		stepSize = brokenStep;
	}
	brokenStep = maxWager - totalWager();
	if (stepSize > brokenStep) {
		stepSize = brokenStep;
	}
	if (stepSize < 0) {
		stepSize *= -1;
	}
	bets[bet] += stepSize;
	playerCash -= stepSize;
	clampCash();

	return 0;
}

static int decreaseWager(int bet) {
	if (bets[bet] <= 2) {
		playerCash += bets[bet];
		clampCash();
		bets[bet] = 0;

	} else {
		playerCash += getMagnitude(bets[bet]);
		clampCash();
		bets[bet] -= getMagnitude(bets[bet]);
	}
	return 0;
}

int main() {
	for (int i = 0; i < 6; i++) { // prints every bet
		printf("%d", bets[i]);
		printf("\n");
	}
	printf("%d", playerCash);
	
	return 0;

}
