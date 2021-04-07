package p2;

public class A {
  public boolean isEven(int v) {
    return v % 2 == 0;
  }

  public void m1(int v) {
    if (this.isEven(v)) {
      System.out.println("even");
    } else {
      System.out.println("odd");
    }
  }
}
