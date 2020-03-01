package refdiff.extractor;

import com.google.gson.annotations.SerializedName;

import refdiff.core.diff.Relationship;

public class Refactoring {
	@SerializedName("type") 
	private String type;
	@SerializedName("object_type") 
	private String objectType;
	
	@SerializedName("before_local_name") 
	private String beforeLocalName;
	@SerializedName("before_file_name") 
	private String beforeFileName;
	@SerializedName("before_begin") 
	private int beforeBegin;
	@SerializedName("before_end") 
	private int beforeEnd;
	@SerializedName("before_line_number") 
	private int beforeLineNumber;

	@SerializedName("after_local_name") 
	private String afterLocalName;
	@SerializedName("after_file_name") 
	private String afterFileName;
	@SerializedName("after_begin") 
	private int afterBegin;
	@SerializedName("after_end") 
	private int afterEnd;
	@SerializedName("after_line_number") 
	private int afterLineNumber;
	
	public static Refactoring FromRelationship(Relationship rel) {
		Refactoring refactoring = new Refactoring();
		refactoring.type = rel.getType().toString();
		refactoring.objectType = rel.getNodeAfter().getType().replace("Declaration", "").toUpperCase();
		
		refactoring.beforeLocalName = rel.getNodeBefore().getLocalName();
		refactoring.beforeBegin = rel.getNodeBefore().getLocation().getBegin();
		refactoring.beforeEnd = rel.getNodeBefore().getLocation().getEnd();
		refactoring.beforeFileName = rel.getNodeBefore().getLocation().getFile();
		refactoring.beforeLineNumber = rel.getNodeBefore().getLocation().getLine();

		refactoring.afterLocalName = rel.getNodeAfter().getLocalName();
		refactoring.afterBegin = rel.getNodeAfter().getLocation().getBegin();
		refactoring.afterEnd = rel.getNodeAfter().getLocation().getEnd();
		refactoring.afterFileName = rel.getNodeAfter().getLocation().getFile();
		refactoring.afterLineNumber = rel.getNodeAfter().getLocation().getLine();
	
		return refactoring;
	}

	@Override
	public String toString() {
		return String.format("Type: %s %s | Before: %s %s:%d | After: %s %s:%d ", this.type, this.objectType, this.beforeLocalName, this.beforeFileName,
				this.beforeLineNumber, this.afterLocalName, this.afterFileName, this.afterLineNumber);
	}
	
	
}
