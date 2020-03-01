package refdiff.extractor;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;

import org.apache.http.HttpEntity;
import org.apache.http.ParseException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.eclipse.jgit.errors.AmbiguousObjectException;
import org.eclipse.jgit.errors.IncorrectObjectTypeException;
import org.eclipse.jgit.errors.MissingObjectException;
import org.eclipse.jgit.errors.RevisionSyntaxException;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevWalk;

import com.google.gson.Gson;

import refdiff.core.RefDiff;
import refdiff.core.diff.CstDiff;
import refdiff.core.diff.Relationship;
import refdiff.core.io.GitHelper;
import refdiff.parsers.c.CPlugin;
import refdiff.parsers.java.JavaPlugin;
import refdiff.parsers.js.JsPlugin;

public class RefDiffExtractor {
	public static void main(String[] args) throws Exception {
		System.out.println("ENVIRONMENT");
		System.out.println("--------");
		System.out.println("GITHUB_REPOSITORY: " +System.getenv("GITHUB_REPOSITORY"));
		System.out.println("GITHUB_WORKSPACE: " +System.getenv("GITHUB_WORKSPACE"));
		System.out.println("GITHUB_REF: " +System.getenv("GITHUB_REF"));
		System.out.println("REV_BEFORE: " +System.getenv("REV_BEFORE"));
		System.out.println("REV_AFTER: " +System.getenv("REV_AFTER"));
		System.out.println("LANGUAGE: " +System.getenv("LANGUAGE"));
		
		String ref = System.getenv("GITHUB_REF");
		Pattern pattern = Pattern.compile("pull/(\\d+)");
	    Matcher matcher = pattern.matcher(ref);
	    if (!matcher.find()) {
	    	System.err.println("Invalid PR reference: "+ref);
	    }
	    
	    int PR = Integer.valueOf(matcher.group(1));
	    System.out.println("PR_NUMBER = "+PR);
		
		scanRefactorings(System.getenv("GITHUB_WORKSPACE") +"/.git", System.getenv("REV_BEFORE"), System.getenv("REV_AFTER"), PR);
	}

	private static void scanRefactorings(String repositoryPath, String reference, String commitAfter, int PR) throws Exception {
		File tempFolder = new File("temp");
		RefDiff refdiff;
		
		String language = "java";
		if (System.getenv("LANGUAGE") != null) {
			language = System.getenv("LANGUAGE").toLowerCase();
		}
		
		switch (language) {
		case "javascript":
			refdiff = new RefDiff(new JsPlugin());
			break;
		case "c":
			refdiff = new RefDiff(new CPlugin());
			break;
		default:
			refdiff = new RefDiff(new JavaPlugin(tempFolder));
		}
		
		try (Repository repo = GitHelper.openRepository(new File(repositoryPath)); RevWalk rw = new RevWalk(repo)) {
			RevCommit revAfter;
			try {
				revAfter = rw.parseCommit(repo.resolve(commitAfter));
				RevCommit head = rw.parseCommit(repo.resolve(reference));
				saveRefactorign(refdiff.computeDiffBetweenRevisions(repo, head, revAfter), PR);
			} catch (Exception e) {
				System.err.println("Error on get content from commits: "+e.getMessage());
			}
		}
	}

	private static void saveRefactorign(CstDiff diff, int PR) {
		List<Refactoring> refactorings = new ArrayList<>();
		
		if (diff.getRefactoringRelationships().size() > 0) {
			System.out.println("\nREFACTORINGS");
			System.out.println("-------------");
		}
		
		for (Relationship rel : diff.getRefactoringRelationships()) {
			Refactoring refactoring = Refactoring.FromRelationship(rel);
			refactorings.add(refactoring);
			System.out.println(refactoring);
		}
		
		String content = new Gson().toJson(refactorings);
		HttpPost post = new HttpPost(String.format("http://refdiff.brito.com.br/%s/%d", System.getenv("GITHUB_REPOSITORY"), PR));
		try {
			HttpEntity entity = new StringEntity(content);
	        post.setEntity(entity);
	        CloseableHttpClient httpClient = HttpClients.createDefault();
	        CloseableHttpResponse response = httpClient.execute(post);
			System.out.println(EntityUtils.toString(response.getEntity()));
		} catch (ParseException | IOException e) {
			System.err.println("Error on save pull request data: " + e.getMessage());
		}
		
        System.out.println("Finished!");
	}

}
