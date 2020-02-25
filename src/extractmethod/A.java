package extractmethod;

public class A {
	public void M1(int v) {
		if (this.isEven(v)) {
			System.out.println("even");
		} else {
			System.out.println("odd");
		}
	}

	public boolean isEven(int v) {
		return v % 2 == 0;
	}
}